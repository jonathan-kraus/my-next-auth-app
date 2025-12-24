import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await auth();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { session, response: null };
}
