// utils/app-log.ts (CLIENT-ONLY)
export type AppLogInput = {
  source: string;
  message: string;
  metadata?: unknown; // must be JSON-serializable
  userId?: string;
  severity?: "info" | "warn" | "error";
  requestId?: string;
};

export async function appLog(input: AppLogInput) {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // swallow on client – logging should never break UX
  }
}
