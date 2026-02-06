import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { updateRotationSchema } from '@/lib/validations/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const rotation = await prisma.rotation.findUnique({
      where: { id },
      include: {
        clerkship: true,
        enrollments: {
          include: { student: true },
        },
      },
    });

    if (!rotation) return apiError('Rotation not found', 404);
    return NextResponse.json(rotation);
  } catch (error) {
    return handlePrismaError(error, 'rotation');
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
    const result = updateRotationSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const data: Record<string, unknown> = { ...result.data };
    if (data.startDate) data.startDate = new Date(data.startDate as string);
    if (data.endDate) data.endDate = new Date(data.endDate as string);

    const rotation = await prisma.rotation.update({
      where: { id },
      data,
    });

    return NextResponse.json(rotation);
  } catch (error) {
    return handlePrismaError(error, 'rotation');
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
    await prisma.rotation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error, 'rotation');
  }
}
