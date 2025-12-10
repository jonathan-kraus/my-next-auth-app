// utils/app-log.ts
import "server-only";
import { dbFetch } from "@/lib/dbFetch";
import { createRequestId } from "@/lib/uuidj";
import type { Prisma } from "@prisma/client"; // important

type LogInput = {
  source: string;
  message: string;
  metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
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
        metadata, // now correctly typed
      },
    }),
  );

  return { requestId };
}

export async function appLog(input: LogInput) {
  if (typeof window === "undefined") {
    return logOnServer(input);
  }

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
