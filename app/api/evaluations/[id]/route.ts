import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { updateEvaluationSchema } from '@/lib/validations/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true,
            rotation: { include: { clerkship: true } },
          },
        },
      },
    });

    if (!evaluation) return apiError('Evaluation not found', 404);
    return NextResponse.json(evaluation);
  } catch (error) {
    return handlePrismaError(error, 'evaluation');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    // Check if evaluation exists and is still editable
    const existing = await prisma.evaluation.findUnique({ where: { id } });
    if (!existing) return apiError('Evaluation not found', 404);
    if (existing.isComplete && !existing.isDraft) {
      return apiError('Cannot edit a submitted evaluation', 403);
    }

    const body = await request.json();
    const result = updateEvaluationSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const data: Record<string, unknown> = { ...result.data };
    if (data.evaluationDate) data.evaluationDate = new Date(data.evaluationDate as string);

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data,
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    return handlePrismaError(error, 'evaluation');
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const existing = await prisma.evaluation.findUnique({ where: { id } });
    if (!existing) return apiError('Evaluation not found', 404);
    if (existing.isComplete && !existing.isDraft) {
      return apiError('Cannot delete a submitted evaluation', 403);
    }

    await prisma.evaluation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error, 'evaluation');
  }
}
