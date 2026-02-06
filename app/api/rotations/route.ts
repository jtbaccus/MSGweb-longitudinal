import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { validationError, handlePrismaError } from '@/lib/api-helpers';
import { createRotationSchema } from '@/lib/validations/schemas';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const clerkshipId = request.nextUrl.searchParams.get('clerkshipId');
    const academicYear = request.nextUrl.searchParams.get('academicYear');

    const rotations = await prisma.rotation.findMany({
      where: {
        ...(clerkshipId ? { clerkshipId } : {}),
        ...(academicYear ? { academicYear } : {}),
      },
      include: { clerkship: true },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(rotations);
  } catch (error) {
    return handlePrismaError(error, 'rotation');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = createRotationSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const rotation = await prisma.rotation.create({
      data: {
        clerkshipId: result.data.clerkshipId,
        startDate: new Date(result.data.startDate),
        endDate: new Date(result.data.endDate),
        academicYear: result.data.academicYear,
      },
      include: { clerkship: true },
    });

    return NextResponse.json(rotation, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'rotation');
  }
}
