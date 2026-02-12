import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { updateClerkshipSchema } from '@/lib/validations/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const clerkship = await prisma.clerkship.findUnique({
      where: { id },
      include: { rotations: true },
    });

    if (!clerkship) return apiError('Clerkship not found', 404);
    return NextResponse.json(clerkship);
  } catch (error) {
    return handlePrismaError(error, 'clerkship');
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
    const result = updateClerkshipSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const clerkship = await prisma.clerkship.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(clerkship);
  } catch (error) {
    return handlePrismaError(error, 'clerkship');
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
    await prisma.clerkship.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error, 'clerkship');
  }
}
