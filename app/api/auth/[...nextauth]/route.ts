export const runtime = 'nodejs';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import db from '@/lib/db';

// 👇 force Node runtime so Prisma doesn't get bundled into client engine

const handler = NextAuth({
  adapter: PrismaAdapter(db as any), // 👈 cast fixes the TS type mismatch
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // If you are using a database adapter, user will be defined
      if (user && 'id' in user) {
        session.user.id = user.id;
      } else if (token && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
