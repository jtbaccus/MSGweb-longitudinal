import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { validationError, handlePrismaError } from '@/lib/api-helpers';
import { csvImportSchema } from '@/lib/validations/schemas';
import { parseCSV } from '@/lib/utils/csv';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const result = csvImportSchema.safeParse(body);
    if (!result.success) return validationError(result.error);

    const { rows, errors } = parseCSV(result.data.csv, ['name']);

    const created: string[] = [];
    const skipped: string[] = [];

    for (const row of rows) {
      // Skip duplicates by email if email is provided
      if (row.email) {
        const existing = await prisma.student.findUnique({
          where: { email: row.email },
        });
        if (existing) {
          skipped.push(`${row.name} (${row.email}) — already exists`);
          continue;
        }
      }

      await prisma.student.create({
        data: {
          name: row.name,
          email: row.email || null,
          medicalSchoolId: row.medicalschoolid || row.id || null,
        },
      });
      created.push(row.name);
    }

    return NextResponse.json({
      created: created.length,
      skipped: skipped.length,
      errors,
      details: { created, skipped },
    }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error, 'student import');
  }
}
