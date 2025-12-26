// lib/server/requireAuth.ts

import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getServerSession(authConfig);

  if (!session) {
    return NextResponse.redirect('/api/auth/signin');
  }

  return session;
}
