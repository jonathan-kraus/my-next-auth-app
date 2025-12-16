// lib/db.ts
import { PrismaClient } from '@/src/generated';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

declare global {
  var db: PrismaClient | undefined;
}

export const db =
  global.db ||
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}
