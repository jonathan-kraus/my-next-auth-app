// app/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const providers = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
];

// Add Google provider only when credentials are configured
if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }) as any
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // make sure this is set in env
  session: {
    strategy: 'jwt', // <-- important
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log('[auth] signIn callback:', {
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
          email: user?.email,
        });
      } catch (e) {
        console.log('[auth] signIn logging error', e);
      }
      // If no account or no email, nothing to link
      if (!account || !user?.email) return true;

      // Only attempt linking for OAuth providers (e.g., google)
      if (account.provider === 'google') {
        const { prisma } = await import('./prisma');

        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (existing && existing.id !== user.id) {
          // If the provider account doesn't already exist, attach it to the existing user
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId!,
              },
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existing.id,
                type: account.type ?? 'oauth',
                provider: account.provider,
                providerAccountId: account.providerAccountId!,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at
                  ? Number(account.expires_at)
                  : null,
                token_type: (account as any).token_type,
                scope: (account as any).scope,
                id_token: (account as any).id_token,
              },
            });
          }

          // Delete the duplicate user record that NextAuth may have created for this sign-in
          try {
            await prisma.user.delete({ where: { id: user.id } });
          } catch (e) {
            // ignore deletion errors
          }
        }
      }

      return true;
    },
  },
};
