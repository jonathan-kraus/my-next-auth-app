// lib/db.ts
import { PrismaClient } from "../src/generated";

declare global {
  // Avoid multiple instances in dev
  var prisma: PrismaClient | undefined;
}

let db: PrismaClient;

if (typeof window === "undefined") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  db = global.prisma;
} else {
  db = new PrismaClient();
}

export default db;
