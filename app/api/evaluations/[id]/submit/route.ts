import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, handlePrismaError } from '@/lib/api-helpers';

export async function POST(
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
      return apiError('Evaluation is already submitted', 400);
    }

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        isComplete: true,
        isDraft: false,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    return handlePrismaError(error, 'evaluation');
  }
}
