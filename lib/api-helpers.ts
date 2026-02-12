import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/** Parse pagination params from request URL. */
export function parsePagination(request: NextRequest) {
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize')) || 25));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

/** Return a consistent JSON error response. */
export function apiError(
  message: string,
  status: number,
  details?: Record<string, string[]>
) {
  const body: { error: string; details?: Record<string, string[]> } = { error: message };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

/** Convert a Zod error into a 400 response with field-level detail. */
export function validationError(zodError: z.ZodError) {
  const flat = zodError.flatten();
  return apiError('Validation failed', 400, flat.fieldErrors as Record<string, string[]>);
}

/** Convert common Prisma errors into appropriate HTTP responses. */
export function handlePrismaError(error: unknown, entityName: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  ) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };

    switch (prismaError.code) {
      case 'P2002':
        return apiError(`${entityName} already exists`, 409);
      case 'P2025':
        return apiError(`${entityName} not found`, 404);
      case 'P2003':
        return apiError(`Related record not found`, 400);
    }
  }

  console.error(`Error in ${entityName} operation:`, error);
  return apiError(`Failed to process ${entityName}`, 500);
}
