import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError } from '@/lib/api-helpers';
import { createStudentSchema } from '@/lib/validations/schemas';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const search = request.nextUrl.searchParams.get('search');

    const students = await prisma.student.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { medicalSchoolId: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(students);
  } catch (error) {
    return handlePrismaError(error, 'student');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = createStudentSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const student = await prisma.student.create({ data: result.data });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'student');
  }
}
