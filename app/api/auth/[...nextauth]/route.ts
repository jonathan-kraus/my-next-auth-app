import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "@/lib/db";

export { handler as GET, handler as POST };
// 👇 force Node runtime so Prisma doesn't get bundled into client engine
export const runtime = "nodejs";
const handler = NextAuth(authOptions)({
  adapter: PrismaAdapter(db as any), // 👈 cast fixes the TS type mismatch
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
