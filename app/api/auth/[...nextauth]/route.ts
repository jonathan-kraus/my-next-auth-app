// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { appLog } from '@/utils/app-log';
console.log('authOptions:', authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

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
