// utils/app-log.ts
import { PrismaClient } from '@prisma/client';

export type AppLogInput = {
  source: string;
  message: string;
  metadata?: unknown; // JSON-serializable
  severity?: 'info' | 'warn' | 'error';
  requestId?: string;
};

// Singleton Prisma client for server-side
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function appLog(input: AppLogInput) {
  try {
    if (typeof window === 'undefined') {
      // SERVER SIDE: write directly to DB
      await prisma.log.create({
        data: {
          source: input.source,
          message: input.message,
          metadata: input.metadata as any,
          severity: input.severity ?? 'info',
          requestId: input.requestId,
          timestamp: new Date(),
        },
      });
    } else {
      // CLIENT SIDE: call API route
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    }
  } catch (err) {
    console.error('appLog failed', err);
  }
}
