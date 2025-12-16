// app/api/test-log/route.ts

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// We'll use a dynamic name/email to ensure the record is new every time
const TEST_NAME = `TestUser-${Date.now()}`;
const TEST_EMAIL = `test-${Date.now()}@example.com`;

export async function GET(request: Request) {
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

    // 2. Attempt to READ all jtemp rows to confirm the write worked
    const allJtempRows = await db.jtemp.findMany();

    console.log(`--- JTEMP WRITE SUCCESSFUL ---`);
    console.log(`New row created with ID: ${newJtempRow.id}`);

    return NextResponse.json({
      success: true,
      message: 'JTemp record created and verified.',
      newRow: newJtempRow,
      totalRows: allJtempRows.length,
    });
  } catch (error) {
    let errorMessage = 'An error occurred during jtemp write test.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(`--- JTEMP WRITE FAILED ---`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'JTemp write failed.',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
