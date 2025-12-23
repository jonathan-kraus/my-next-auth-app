// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import type { NextAuthOptions } from 'next-auth';
import { betterAuth } from 'better-auth';
import { neonAdapter } from 'better-auth/adapters/neon';
import { Pool } from '@neondatabase/serverless';

// Define your auth options
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: neonAdapter(pool),
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.NEXTAUTH_URL || 'http://localhost:3000'],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    },
  },
});

export const authOptions = auth;

// Create the handler
const handler = NextAuth(authOptions);

// Export for both GET and POST
export { handler as GET, handler as POST };
