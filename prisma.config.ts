// prisma.config.ts

import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

// 1. Initialize the Neon driver/client
const connectionString = `${process.env.DATABASE_URL}`;
const neonDatabaseUrl = neon(connectionString);

// 2. Create the PrismaNeon adapter instance
const adapter = new PrismaNeon(neonDatabaseUrl);

// 3. Export the configuration object that Prisma CLI expects.
// This object MUST contain the 'adapter' property.
export default {
    adapter: adapter,
};