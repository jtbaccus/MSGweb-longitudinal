import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError, handlePrismaError, parsePagination } from '@/lib/api-helpers';
import { createStudentSchema } from '@/lib/validations/schemas';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const search = request.nextUrl.searchParams.get('search');
    const paginate = request.nextUrl.searchParams.has('page');

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { medicalSchoolId: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const include = {
      enrollments: {
        include: {
          rotation: {
            include: { clerkship: true },
          },
        },
      },
    };

    if (paginate) {
      const { skip, take, page, pageSize } = parsePagination(request);
      const [students, total] = await Promise.all([
        prisma.student.findMany({ where, include, orderBy: { name: 'asc' }, skip, take }),
        prisma.student.count({ where }),
      ]);
      return NextResponse.json({
        data: students,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    }

    const students = await prisma.student.findMany({
      where,
      include,
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
