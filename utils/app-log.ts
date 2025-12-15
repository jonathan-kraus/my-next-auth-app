// utils/app-log.ts (CLIENT-ONLY)
console.log('appLog about to run');
export type AppLogInput = {
  source: string;
  message: string;
  metadata?: unknown; // JSON-serializable
  severity?: 'info' | 'warn' | 'error';
  requestId?: string;
};
console.log('appLog about to run middle');
export async function appLog(input: AppLogInput) {
  try {
    console.log('appLog in try block', input);
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    // ignore on client
  }
  console.log('appLog finished');
}
