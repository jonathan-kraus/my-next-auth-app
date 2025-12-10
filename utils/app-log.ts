// utils/app-log.ts
import "server-only"; // ensures this file is only bundled on server

import { dbFetch } from "@/lib/dbFetch";
import { createRequestId } from "@/lib/uuidj";

type LogInput = {
  source: string;
  message: string;
  metadata?: unknown;
  userId?: string;
  severity?: "info" | "warn" | "error";
  requestId?: string;
};

async function logOnServer(input: LogInput) {
  const {
    source,
    message,
    metadata,
    userId = "cmiz0p9ro000004ldrxgn3a1c",
    severity = "info",
    requestId = createRequestId(),
  } = input;

  await dbFetch(({ db }) =>
    db.log.create({
      data: {
        userId,
        severity,
        source,
        message,
        requestId,
        metadata,
      },
    }),
  );

  return { requestId };
}

// This is the one helper you import everywhere
export async function appLog(input: LogInput) {
  // If there is no window, we're on the server
  if (typeof window === "undefined") {
    return logOnServer(input);
  }

  // Client: call server via fetch
  try {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}
