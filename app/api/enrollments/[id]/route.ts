import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { updateEnrollmentSchema } from '@/lib/validations/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
      include: {
        student: true,
        rotation: { include: { clerkship: true } },
        evaluations: { orderBy: { periodNumber: 'asc' } },
        summaries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!enrollment) return apiError('Enrollment not found', 404);
    return NextResponse.json(enrollment);
  } catch (error) {
    return handlePrismaError(error, 'enrollment');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateEnrollmentSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const data: Record<string, unknown> = { ...result.data };
    if (data.startDate) data.startDate = new Date(data.startDate as string);
    if (data.endDate) data.endDate = new Date(data.endDate as string);

    const enrollment = await prisma.studentEnrollment.update({
      where: { id },
      data,
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    return handlePrismaError(error, 'enrollment');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await prisma.studentEnrollment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error, 'enrollment');
  }
}
