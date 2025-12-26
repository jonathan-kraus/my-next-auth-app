import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect('/login');
  }

  return session;
}
