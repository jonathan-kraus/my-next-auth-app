// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Use the shared NextAuth options defined in `lib/authOptions`
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
