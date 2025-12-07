// lib/db.ts

import { PrismaClient } from "@/src/generated/client"; // Your custom path

// Define a global property for the Prisma Client instance
// We still use 'global.prisma' for internal persistence (as per convention)
// and to avoid collisions with other global variables.
declare global {
  var prisma: PrismaClient | undefined;
}

// 1. Declare the client variable that will be exported as 'db'
let db: PrismaClient;

if (typeof window === "undefined") {
  // 2. Check if a global instance already exists
  if (!global.prisma) {
    // 3. If not, create a new instance and assign it to the global scope
    global.prisma = new PrismaClient();
  }

  // 4. Assign the global instance to our local 'db' variable
  db = global.prisma;
} else {
  // Fallback for non-server environments
  db = new PrismaClient();
}

// 5. Export the client as 'db'
export default db;
