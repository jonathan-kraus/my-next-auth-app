// app/api/test-log/route.ts

import { createLogger, createRequestId } from "@/lib/logger";
import db from "@/lib/db";
import { NextResponse } from "next/server";

// Variables and logger instantiation can be defined outside the function
// since they don't rely on request-specific data.
const TEST_USER_ID = "cmivgk9b2000004lgnewb1boe";
const log = createLogger("Prisma_Test_Script");

export async function GET(request: Request) {
  const requestId = createRequestId();

  // Variables that rely on dynamic data (like Date.now()) must be defined inside the handler
  const TEST_NAME = `TestUser-${Date.now()}`;
  const TEST_EMAIL = `test-${Date.now()}@example.com`;

  // Log the starting point
  await log.info(`Starting Jtemp write test.`, TEST_USER_ID, requestId);
  console.log(`--- STARTING JTEMP WRITE TEST ---`);

  try {
    // 1. Attempt to CREATE a new record in the jtemp table
    const newJtempRow = await db.jtemp.create({
      data: {
        name: TEST_NAME,
        email: TEST_EMAIL,
        // Assuming 'created_at' is set to @default(now()) in your schema
      },
    });

    // Log success!
    await log.info("JTemp write successful.", TEST_USER_ID, requestId, {
      newId: newJtempRow.id,
    });

    console.log(`--- JTEMP WRITE SUCCESSFUL --- New ID: ${newJtempRow.id}`);

    // 2. Return success response
    return NextResponse.json({
      success: true,
      message: "JTemp created.",
      newRow: newJtempRow,
    });
  } catch (error) {
    let errorMessage = "An unknown database error occurred.";

    // Safely extract the error message
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Log error!
    await log.error("JTemp write failed.", TEST_USER_ID, requestId, {
      errorMessage: errorMessage,
    });

    console.error(`--- JTEMP WRITE FAILED --- Error: ${errorMessage}`);

    // 3. Return error response
    return NextResponse.json(
      { success: false, message: "JTemp failed.", error: errorMessage },
      { status: 500 },
    );
  }
}
