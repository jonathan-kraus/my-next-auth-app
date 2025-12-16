import { PrismaClient } from '@/src/generated';
import { Prisma } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { safeMetadata } from './safe-metadata';

export type AppLogInput = {
  source: string;
  message: string;
  metadata?: unknown;
  severity?: 'info' | 'warn' | 'error';
  requestId?: string;
};

// Pass DATABASE_URL directly as a string
const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['error'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function appLog(input: AppLogInput) {
  try {
    if (typeof window === 'undefined') {
      await prisma.log.create({
        data: {
          source: input.source,
          message: input.message,
          metadata: input.metadata
            ? safeMetadata(input.metadata)
            : Prisma.JsonNull,
          severity: input.severity ?? 'info',
          requestId: input.requestId,
          timestamp: new Date(),
        },
      });
    } else {
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
