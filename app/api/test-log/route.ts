// app/api/test-log/route.ts
import { NextResponse } from "next/server";
import { dbFetch } from "@/lib/dbFetch";
import { getCurrentUser } from "@/lib/currentUser";

export async function GET(request: Request) {
  const TEST_NAME = `TestUser-${Date.now()}`;
  const USER_ID = "70044dfe-d497-41d9-99ae-3d9e39761e6d"; // Melissa's id
  //const USER_ID = "cmivgk9b2000004lgnewb1boe"; // Jonathan's id
  console.log(`--- STARTING JTEMP WRITE for ${TEST_NAME} ---`);
  const user = await getCurrentUser();
  console.log("Current user:", user);
  console.log("About to write log with userId:", USER_ID);
  // 1. Write a log row
  await dbFetch(({ db }) =>
    db.log.create({
      data: {
        userId: USER_ID, // test user id
        severity: "INFO",
        source: "test-log",
        message: "Invoked /api/test-log",
        requestId: null,
        metadata: {
          userAgent: request.headers.get("User-Agent") || "Unknown",

          ip:
            request.headers.get("X-Forwarded-For") ||
            request.headers.get("Remote-Addr") ||
            "Unknown",
          user: user as any,
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
