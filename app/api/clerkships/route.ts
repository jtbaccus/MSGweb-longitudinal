import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { validationError, handlePrismaError } from '@/lib/api-helpers';
import { createClerkshipSchema } from '@/lib/validations/schemas';
import type { ClerkshipType } from '@/src/generated/prisma/enums';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const type = request.nextUrl.searchParams.get('type');

    const clerkships = await prisma.clerkship.findMany({
      where: type ? { type: type as ClerkshipType } : undefined,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(clerkships);
  } catch (error) {
    return handlePrismaError(error, 'clerkship');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = createClerkshipSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const clerkship = await prisma.clerkship.create({ data: result.data });
    return NextResponse.json(clerkship, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'clerkship');
  }
}
