// app/lib/authOptions.ts
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { appLog } from '@/utils/app-log';

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
      allowDangerousEmailAccountLinking: true,
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
        // lightweight DB log for sign-in attempts
        await appLog({
          source: 'auth.signIn',
          message: 'signIn callback invoked',
          metadata: {
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
            email: user?.email,
            userId: user?.id,
            accountRaw: account ?? null,
          },
        });
      } catch (e) {
        console.error('[auth] appLog error', e);
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
  logger: {
    error(code: unknown, metadata?: unknown) {
      try {
        appLog({
          source: 'auth.error',
          message: 'NextAuth logger.error',
          metadata: { code, metadata },
          severity: 'error',
        }).catch(() => {});
      } catch (e) {
        console.error('[auth] logger.error appLog failed', e);
      }
      // Also surface to server console for visibility

      console.error('[NextAuth][error]', code, metadata);
    },
    warn(code: unknown) {
      try {
        appLog({
          source: 'auth.warn',
          message: 'NextAuth logger.warn',
          metadata: { code },
          severity: 'warn',
        }).catch(() => {});
      } catch (e) {
        console.error('[auth] logger.warn appLog failed', e);
      }

      console.warn('[NextAuth][warn]', code);
    },
    debug(code: unknown) {
      try {
        appLog({
          source: 'auth.debug',
          message: 'NextAuth logger.debug',
          metadata: { code },
        }).catch(() => {});
      } catch (e) {
        // ignore logging errors
      }

      console.debug('[NextAuth][debug]', code);
    },
  },
};
