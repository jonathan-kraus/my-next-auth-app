// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";
// ❌ DELETE OR COMMENT OUT THIS LINE: import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from "@prisma/adapter-neon";

// 1. Get the connection string
const connectionString: string = process.env.DATABASE_URL!;

// 2. Initialize the Prisma Adapter by passing the connectionString directly
//    This skips the manual Pool instantiation that is causing the TypeError.
const adapter = new PrismaNeon({ connectionString });

// 3. Initialize the Prisma Client, passing the adapter
//    Note: You may still need the 'as any' or casting if TypeScript complains
const db = new PrismaClient({ adapter });

export default db;
