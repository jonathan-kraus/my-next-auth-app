// lib/logs.ts
//import { createLogger, createRequestId } from "@/lib/logger";
import { dbFetch } from './dbFetch';
import { db } from '@/lib/db';
// const TEST_USER_ID = "cmivgk9b2000004lgnewb1boe";
// const log = createLogger("Initiating_Log_Viewer_Page");
// const requestId = createRequestId();
//console.log("logs module loaded");
export async function getLogs(options?: { severity?: string }) {
  const normalizedSeverity = options?.severity?.toLowerCase();
  //await log.info(`Starting log viewer`, TEST_USER_ID, requestId);

  async function main() {
    const user = await db.user.findUnique({
      where: { id: '70044dfe-d497-41d9-99ae-3d9e39761e6d' },
    });
    console.log('User for test id:', user);
  }

  main().catch(console.error);
  const logs = await dbFetch(({ db }) =>
    db.log.findMany({
      where: normalizedSeverity ? { severity: normalizedSeverity } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 200,
      include: { user: { select: { email: true } } },
    })
  );
  console.log('Fetched logs:', logs.length);
  return logs;
}
