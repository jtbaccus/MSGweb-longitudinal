import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, handlePrismaError } from '@/lib/api-helpers';
import {
  calculateTotalPeriods,
  calculateCurrentPeriod,
  calculateTrend,
} from '@/lib/utils/progress';
import type { Clerkship, SavedEvaluation } from '@/lib/types/longitudinal';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { enrollmentId } = await params;

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        rotation: { include: { clerkship: true } },
        evaluations: { orderBy: { periodNumber: 'asc' } },
        summaries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!enrollment) return apiError('Enrollment not found', 404);

    const clerkship = enrollment.rotation.clerkship as unknown as Clerkship;
    const evaluations = enrollment.evaluations as unknown as SavedEvaluation[];

    const totalPeriods = calculateTotalPeriods(clerkship);
    const currentPeriod = calculateCurrentPeriod(enrollment.startDate, clerkship);
    const completedEvaluations = evaluations.filter((e) => e.isComplete).length;
    const progressPercentage = totalPeriods > 0
      ? Math.round((completedEvaluations / totalPeriods) * 100)
      : 0;

    return NextResponse.json({
      student: enrollment.student,
      enrollment: {
        id: enrollment.id,
        studentId: enrollment.studentId,
        rotationId: enrollment.rotationId,
        startDate: enrollment.startDate,
        endDate: enrollment.endDate,
        status: enrollment.status,
        createdAt: enrollment.createdAt,
      },
      rotation: enrollment.rotation,
      clerkship,
      evaluations,
      summaries: enrollment.summaries,
      currentPeriod,
      totalPeriods,
      progressPercentage,
      performanceTrend: calculateTrend(evaluations),
    });
  } catch (error) {
    return handlePrismaError(error, 'progress');
  }
}
