// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { appLog } from '@/utils/app-log';

// Log incoming auth route invocations for debugging
try {
  appLog({
    source: 'auth.route',
    message: 'NextAuth route module loaded',
    metadata: { env: process.env.NODE_ENV },
  }).catch(() => {});
} catch (e) {
  // ignore logging errors
}

// Use the shared NextAuth options defined in `lib/authOptions`
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
