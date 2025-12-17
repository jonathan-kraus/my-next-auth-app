// app/api/test-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
