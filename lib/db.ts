// lib/db.ts

import { PrismaClient } from '@/src/generated/client';
// 🎯 DRIVER: Keep the Pool object from the serverless driver
import { Pool } from '@neondatabase/serverless'; 

// 🎯 FIX: Import the standard PrismaNeon adapter class instead of PrismaNeonHttp
import { PrismaNeon } from '@prisma/adapter-neon'; 
// NOTE: If this fails, try { PrismaNeon } instead of { PrismaNeon }

// 1. Initialize the adapter components
const connectionString = process.env.DATABASE_URL;

// 🎯 FIX 1: Throw the error and assert the type strictly
if (typeof connectionString !== 'string' || connectionString === '') {
  throw new Error("DATABASE_URL must be set in the environment variables.");
}

// 🎯 FIX 2: Create the configuration object that PrismaNeon expects.
// This is the PoolConfig type the constructor is demanding.
const adapterConfig = { connectionString };

// 3. Instantiate PrismaNeon with the configuration object
// The adapter expects PoolConfig, not just the string.
const adapter = new PrismaNeon(adapterConfig);

declare global {
  var db: PrismaClient | undefined; 
}

let db: PrismaClient;

if (typeof window === 'undefined') {
  if (!global.db) {
    // 2. Instantiate with the adapter to satisfy the validation check
    global.db = new PrismaClient({
      adapter, // 🎯 CRITICAL: This satisfies the engine validation check.
      log: ["query", "error", "warn"],
    });
  }
  db = global.db;
} else {
  // Fallback for non-server environments
  db = new PrismaClient({ adapter });
}

export default db; 

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}