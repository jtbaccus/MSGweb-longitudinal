import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { updateSummarySchema } from '@/lib/validations/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const summary = await prisma.progressSummary.findUnique({
      where: { id },
    });

    if (!summary) return apiError('Summary not found', 404);

    return NextResponse.json(summary);
  } catch (error) {
    return handlePrismaError(error, 'summary');
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
    const body = await request.json();
    const result = updateSummarySchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const existing = await prisma.progressSummary.findUnique({
      where: { id },
    });
    if (!existing) return apiError('Summary not found', 404);

    const summary = await prisma.progressSummary.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(summary);
  } catch (error) {
    return handlePrismaError(error, 'summary');
  }
}
