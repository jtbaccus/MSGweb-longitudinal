import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { apiError } from '@/lib/api-helpers';

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return lines.join('\n');
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const type = request.nextUrl.searchParams.get('type');

  try {
    let csv: string;
    let filename: string;

    switch (type) {
      case 'students': {
        const students = await prisma.student.findMany({ orderBy: { name: 'asc' } });
        csv = toCSV(
          ['id', 'name', 'email', 'medicalSchoolId', 'createdAt'],
          students.map(s => [s.id, s.name, s.email || '', s.medicalSchoolId || '', s.createdAt.toISOString()])
        );
        filename = 'students.csv';
        break;
      }

      case 'evaluations': {
        const evaluations = await prisma.evaluation.findMany({
          include: { enrollment: { include: { student: true, rotation: { include: { clerkship: true } } } } },
          orderBy: { createdAt: 'desc' },
        });
        csv = toCSV(
          ['id', 'student', 'clerkship', 'period', 'performanceLevel', 'evaluatorName', 'evaluationDate', 'isComplete', 'isDraft'],
          evaluations.map(e => [
            e.id,
            e.enrollment.student.name,
            e.enrollment.rotation.clerkship.name,
            String(e.periodNumber),
            e.performanceLevel,
            e.evaluatorName,
            e.evaluationDate.toISOString(),
            String(e.isComplete),
            String(e.isDraft),
          ])
        );
        filename = 'evaluations.csv';
        break;
      }

      case 'enrollments': {
        const enrollments = await prisma.studentEnrollment.findMany({
          include: { student: true, rotation: { include: { clerkship: true } } },
          orderBy: { createdAt: 'desc' },
        });
        csv = toCSV(
          ['id', 'student', 'clerkship', 'academicYear', 'startDate', 'endDate', 'status'],
          enrollments.map(e => [
            e.id,
            e.student.name,
            e.rotation.clerkship.name,
            e.rotation.academicYear,
            e.startDate.toISOString(),
            e.endDate?.toISOString() || '',
            e.status,
          ])
        );
        filename = 'enrollments.csv';
        break;
      }

      case 'summaries': {
        const summaries = await prisma.progressSummary.findMany({
          include: { enrollment: { include: { student: true, rotation: { include: { clerkship: true } } } } },
          orderBy: { createdAt: 'desc' },
        });
        csv = toCSV(
          ['id', 'student', 'clerkship', 'type', 'overallPerformance', 'authorName', 'createdAt'],
          summaries.map(s => [
            s.id,
            s.enrollment.student.name,
            s.enrollment.rotation.clerkship.name,
            s.type,
            s.overallPerformance,
            s.authorName,
            s.createdAt.toISOString(),
          ])
        );
        filename = 'summaries.csv';
        break;
      }

      default:
        return apiError('Invalid type. Use: students, evaluations, enrollments, or summaries', 400);
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
