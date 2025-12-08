// lib/logs.ts
import db from "@/lib/db";
import { createLogger, createRequestId } from "@/lib/logger";
const TEST_USER_ID = "cmivgk9b2000004lgnewb1boe";
const log = createLogger("Initiating_Log_Viewre_Page");
const requestId = createRequestId();
await log.info(`Starting Jtemp write test.`, TEST_USER_ID, requestId);
export async function getLogs(options?: { severity?: string }) {
  const logs = await db.log.findMany({
    where: options?.severity
      ? { severity: options.severity }
      : undefined,
    orderBy: { timestamp: "desc" },
    take: 500,
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  return logs;
}
