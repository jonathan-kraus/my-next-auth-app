// app/api/log-view/route.ts
import { NextResponse } from "next/server";
import { dbFetch } from "@/lib/dbFetch";
import { createRequestId } from "@/lib/uuidj";

export async function POST() {
  const requestId = createRequestId();

  await dbFetch(({ db }) =>
    db.log.create({
      data: {
        userId: "cmiz0p9ro000004ldrxgn3a1c",
        severity: "info",
        source: "log",
        message: "Invoking viewer",
        requestId,
        metadata: {
          action: "view",
          timestamp: new Date().toISOString(),
        },
      },
    }),
  );

  return NextResponse.json({ ok: true, requestId });
}
