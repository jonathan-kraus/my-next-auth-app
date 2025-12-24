// lib/db.ts
import { PrismaClient } from '@/src/generated';

declare global {
  // allow global `db` to survive hot reloads in dev
  var db: PrismaClient | undefined;
}

// No adapter. Prisma reads DATABASE_URL automatically.
// This is the correct, build‑safe, Neon‑compatible setup.
export const db =
  global.db ||
  new PrismaClient({
    log: ['info', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}
