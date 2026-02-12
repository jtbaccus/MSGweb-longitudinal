import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { validationError, handlePrismaError } from '@/lib/api-helpers';
import { createEnrollmentSchema } from '@/lib/validations/schemas';
import type { EnrollmentStatus } from '@/src/generated/prisma/enums';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const rotationId = request.nextUrl.searchParams.get('rotationId');
    const studentId = request.nextUrl.searchParams.get('studentId');
    const status = request.nextUrl.searchParams.get('status');

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        ...(rotationId ? { rotationId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(status ? { status: status as EnrollmentStatus } : {}),
      },
      include: {
        student: true,
        rotation: { include: { clerkship: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return handlePrismaError(error, 'enrollment');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = createEnrollmentSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: result.data.studentId,
        rotationId: result.data.rotationId,
        startDate: new Date(result.data.startDate),
        endDate: result.data.endDate ? new Date(result.data.endDate) : null,
        status: result.data.status,
      },
      include: {
        student: true,
        rotation: { include: { clerkship: true } },
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'enrollment');
  }
}
