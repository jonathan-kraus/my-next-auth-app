// prisma.config.ts

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

// 1. Get the DATABASE_URL environment variable
const connectionString = `${process.env.DATABASE_URL}`;

// 2. Initialize the Neon driver/client
const neonDatabaseUrl = neon(connectionString);

// 3. Initialize the Neon Adapter
const adapter = new PrismaNeon(neonDatabaseUrl);

// 4. Create the Prisma Client instance using the adapter
// Note: We're not disabling connection pooling here since the adapter handles it.
const prisma = new PrismaClient({
  adapter,
});

export default prisma;