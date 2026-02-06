import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import type { Session } from 'next-auth';

export type AuthResult =
  | { session: Session; error?: never }
  | { session?: never; error: NextResponse };

/**
 * Require authentication for an API route.
 * Returns the session if authenticated, or an error response if not.
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { session };
}
