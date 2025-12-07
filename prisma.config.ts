// prisma.config.ts

import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';
import "dotenv/config";
export default defineConfig({
schema: "prisma/schema.prisma",
});
// 1. Initialize the Neon driver/client
const connectionString = `${process.env.DATABASE_URL}`;
const neonDatabaseUrl = neon(connectionString);

// 2. Export the adapter configuration
// The Prisma generator will pick this up and use it.
const adapter = new PrismaNeon(neonDatabaseUrl);

export default {
    adapter: adapter,
};