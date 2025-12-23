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
      if (!account || !user?.email) return true;

      if (account.provider === 'google') {
        const { prisma } = await import('./prisma');

        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existing && existing.id !== user.id) {
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
                provider: account.provider,
                providerAccountId: account.providerAccountId!,
                type: account.type,
                access_token: account.access_token,
                id_token: account.id_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                refresh_token: account.refresh_token,
                session_state: account.session_state,
              },
            });
          }

          return true;
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
