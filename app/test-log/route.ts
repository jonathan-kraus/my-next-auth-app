// app/api/test-log/route.ts
import { dbFetch } from "@/lib/dbFetch";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Variables that rely on dynamic data (like Date.now()) must be defined inside the handler
  const TEST_NAME = `TestUser-${Date.now()}`;


  // Log the starting point
  async function logit(req: Request) {
    const body = await req.json();
    const metadata = {
      userAgent: req.headers.get("User-Agent") || "Unknown",
      ip:
        req.headers.get("X-Forwarded-For") ||
        req.headers.get("Remote-Addr") ||
        "Unknown",
    };
    console.log(`--- STARTING JTEMP WRITE for ${TEST_NAME} ---`);
    const log = await dbFetch({ requireUser: true }, ({ db }) =>
      db.log.create({
        data: {
          userId: user!.id,
          severity: body.severity ?? "INFO",
          source: body.source ?? "test-log",
          message: body.message ?? "default message",
          requestId: body.requestId ?? null,
          metadata: metadata ?? null,
        },
      }),
    );
  }

  // 1. Attempt to CREATE a new record in the jtemp table
  async function POST(req: Request) {
    //const body = await req.json();

    const jtemp = await dbFetch({ requireUser: true }, ({ db }) =>
      db.jtemp.create({
        data: {
          name: user!.id,
          email: "bob@Email.com",
        },
      }),
    );

    console.log(`JTemp record created with ID: ${jtemp.id}`);
  }
 // Actually run the work
  await logit(request);
  await POST(request);
  console.log(`--- JTEMP WRITE SUCCESSFUL --- `);

  // 2. Return success response
  return NextResponse.json({
    success: true,
    message: "JTemp created.",
  });
}
