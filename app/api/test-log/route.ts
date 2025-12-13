// app/api/test-log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbFetch } from "@/lib/dbFetch";
import { stackServerApp } from "@/stack/server";
import { createRequestId } from "@/lib/uuidj";
import { appLog } from "@/utils/app-log";
import { triggerEmail } from "@/utils/triggerEmail";
const requestId = createRequestId();
export async function GET(request: Request) {
  const TEST_NAME = `TestUser-${Date.now()}`;
  const USER_ID = "70044dfe-d497-41d9-99ae-3d9e39761e6d"; // Melissa's id
  //   const USER_ID = "cmiz0p9ro000004ldrxgn3a1c"; // Jonathan's id
  //   const session = await auth(); // or getServerSession(...)
  // const userId = session?.user?.id ?? null;
  console.log(`--- STARTING JTEMP WRITE for ${TEST_NAME} ---`);
  async function GET(request: NextRequest) {
    try {
      await triggerEmail(
        "in test-log route",
        requestId,
        `Subject here: ${TEST_NAME}`,
        `Created by ${USER_ID}\n\nTest content here.`,
      );
    } catch (emailErr) {
      console.error("Failed to send post creation email:", emailErr);
      // non-fatal
    }
    return NextResponse.json(
      { success: true, TEST_NAME, note: "Email sent! Check your inbox." },
      { status: 200 },
    );
  }
  const user1 = await stackServerApp.getUser();
  console.log("Current user:", user1);
  await appLog({
    source: "app/api/test-log/route.ts",
    message: "---test-log invoked---",
    metadata: { action: "view" },
  });
  console.log("About to write log with userId:", USER_ID);
  // 1. Write a log row
  await dbFetch(({ db }) =>
    db.log.create({
      data: {
        userId: USER_ID, // test user id
        severity: "info",
        source: "test-log",
        message: "Invoked /api/test-log",
        requestId: requestId,
        metadata: {
          userAgent: request.headers.get("User-Agent") || "Unknown",
          action: "write jtemp",
          ip:
            request.headers.get("X-Forwarded-For") ||
            request.headers.get("Remote-Addr") ||
            "Unknown",
          user: user1 as any,
        },
      },
    }),
  );

  // 2. Create a jtemp row
  const jtemp = await dbFetch(({ db }) =>
    db.jtemp.create({
      data: {
        name: TEST_NAME,
        email: "bob@Email.com",
      },
    }),
  );

  console.log(`JTemp record created with ID: ${jtemp.id}`);

  console.log(`--- JTEMP WRITE SUCCESSFUL ---`);

  return NextResponse.json({
    success: true,
    message: "JTemp created.",
  });
}
