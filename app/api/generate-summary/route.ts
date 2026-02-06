import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { apiError, validationError } from '@/lib/api-helpers';
import { generateSummarySchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await request.json();
  const result = generateSummarySchema.safeParse(body);
  if (!result.success) return validationError(result.error);

  return apiError(
    'Summary generation is not yet implemented. Coming in Phase 7.',
    501
  );
}
