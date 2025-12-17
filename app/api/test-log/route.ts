// app/api/test-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  console.log('Current user:', session?.user);

  return NextResponse.json({
    success: true,
    user: session?.user ?? null,
  });
}
