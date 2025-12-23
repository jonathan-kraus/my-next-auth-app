// app/api/test-log/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';

export async function GET(request: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response; // returns 401 automatically

  // At this point, you’re guaranteed to have a signed‑in user
  return Response.json({
    message: 'You are signed in!',
    user: session.user,
  });
}
