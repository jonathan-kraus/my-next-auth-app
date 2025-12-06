import { PrismaClient } from '@/generated/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
   }).$extends({}); // 👈 makes TS happy
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

