// lib/currentUser.ts

import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth/next';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
