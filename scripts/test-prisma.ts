// scripts/test-prisma.ts
import { PrismaClient } from "@/src/generated/client";
import dotenv from "dotenv";
import db from "../lib/db";
import { createRequestId, createLogger } from '@/lib/logger';


dotenv.config();
export async function GET(request: Request) {
  // 1. Generate the Central Request ID
  const requestId = createRequestId();
  console.log(`Request ID: ${requestId}`);
  const log = createLogger('Prisma_Test_Script');

log.info('Starting Prisma test script.', requestId);

  log.info(`Handling GET request with Request ID: ${requestId}`);
async function main() {
  const rows = await db.jtemp.findMany();
  console.log("jtemp rows:", rows);
}

main()
  .catch((e) => {
    console.error("Error querying jtemp:", e);
  })
  .finally(async () => {
    await db.$disconnect();
  })
  return new Response("Prisma test completed. Check console for output.");
}





