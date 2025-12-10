// utils/app-log.ts
import type { Prisma } from "@prisma/client";

type LogInput = {
  source: string;
  message: string;
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  userId?: string;
  severity?: "info" | "warn" | "error";
  requestId?: string;
};

export async function appLog(input: LogInput) {
  if (typeof window === "undefined") {
    // server side: lazy import to avoid bundling in client
    const { serverAppLog } = await import("./server-app-log");
    return serverAppLog(input);
  }

  // client side: call API route
  const res = await fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => null);

  return res && res.ok ? res.json() : null;
}
