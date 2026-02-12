import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { validationError, handlePrismaError } from '@/lib/api-helpers';
import { createUserSchema } from '@/lib/validations/schemas';
import { hash } from 'bcryptjs';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error, 'user');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const hashedPassword = await hash(result.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: result.data.email,
        name: result.data.name || null,
        password: hashedPassword,
        role: result.data.role || 'USER',
        mustChangePassword: result.data.mustChangePassword ?? false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'user');
  }
}
