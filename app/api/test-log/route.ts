import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/requireAuth';

export async function GET(request: NextRequest) {
  const result = await requireAuth();

  // If not authenticated, result is a NextResponse
  if (result instanceof NextResponse) {
    return result;
  }

  // Otherwise it's a Session — wrap it in a Response
  return NextResponse.json({
    message: 'You are signed in!',
    user: result.user,
  });
}
