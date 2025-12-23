import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { NextAuthOptions } from 'next-auth';
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // <-- NOW this is your DB ID
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // <-- DB ID flows into session
      }
      return session;
    },
  },
};
// Create the handler
const handler = NextAuth(authOptions);

// Export for both GET and POST
export { handler as GET, handler as POST };
