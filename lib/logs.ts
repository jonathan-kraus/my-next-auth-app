// lib/logs.ts
//import { createLogger, createRequestId } from "@/lib/logger";
import { dbFetch } from "./dbFetch";
// const TEST_USER_ID = "cmivgk9b2000004lgnewb1boe";
// const log = createLogger("Initiating_Log_Viewer_Page");
// const requestId = createRequestId();
//console.log("logs module loaded");
export async function getLogs(options?: { severity?: string }) {
  const normalizedSeverity = options?.severity?.toLowerCase();
  //await log.info(`Starting log viewer`, TEST_USER_ID, requestId);
  const logs = await dbFetch(({ db }) =>
    db.log.findMany({
      where: normalizedSeverity ? { severity: normalizedSeverity } : undefined,
      orderBy: { timestamp: "desc" },
      take: 200,
      include: { user: { select: { email: true } } },
    }),
  );

  return logs;
}
