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
const userId = "cmivgk9b2000004lgnewb1boe"; 
await
  log.info(`Handling GET request with Request ID: ${requestId}`, userId, requestId);
  await log.info('test-prisma', userId, requestId, { 
        ipAddress: request.headers.get('x-forwarded-for') 
    });
async function main() {
  const rows = await db.jtemp.findMany();
  console.log("jtemp rows:", rows);
}

main()
  .catch(async (e) => {
    console.error("Error querying jtemp:", e);
    await log.error('test-prisma', userId, requestId, { 
        ipAddress: request.headers.get('x-forwarded-for') 
  })
  .finally(async () => {
    await db.$disconnect();
  })
  return new Response("Prisma test completed. Check console for output.");
});}