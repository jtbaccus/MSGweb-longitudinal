import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { createEvaluationSchema } from '@/lib/validations/schemas';

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
    });
    if (!enrollment) return apiError('Enrollment not found', 404);

    const evaluations = await prisma.evaluation.findMany({
      where: { enrollmentId: id },
      orderBy: { periodNumber: 'asc' },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    return handlePrismaError(error, 'evaluation');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const result = createEvaluationSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    // Verify enrollment exists
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
    });
    if (!enrollment) return apiError('Enrollment not found', 404);

    const evaluation = await prisma.evaluation.create({
      data: {
        enrollmentId: id,
        evaluatorId: auth.session.user.id,
        evaluatorName: result.data.evaluatorName,
        periodNumber: result.data.periodNumber,
        evaluationDate: new Date(result.data.evaluationDate),
        performanceLevel: result.data.performanceLevel,
        selectedCriteriaIds: result.data.selectedCriteriaIds,
        selectedAttributeIds: result.data.selectedAttributeIds,
        narrativeContext: result.data.narrativeContext,
        generatedNarrative: result.data.generatedNarrative,
        editedNarrative: result.data.editedNarrative,
        templateId: result.data.templateId,
        isDraft: result.data.isDraft ?? true,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'evaluation');
  }
}
