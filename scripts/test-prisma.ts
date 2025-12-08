// app/api/test-log/route.ts

import { createLogger, createRequestId } from '@/lib/logger';
import db from '@/lib/db'; // Import your Prisma client instance
import { NextResponse } from 'next/server';

// 🚨 IMPORTANT: Ensure this userId is a valid, existing user ID in your database!
const TEST_USER_ID = "cmivgk9b2000004lgnewb1boe"; 

// Create a logger instance for this module
const log = createLogger('Prisma_Test_Script');

export async function GET(request: Request) {
  const requestId = createRequestId();
  
  // Console log the request ID immediately (will appear in Vercel/terminal logs)
  console.log(`Request ID: ${requestId}`); 
  
  // 1. Log the start of the request. Must be AWAITED.
  await log.info(
    `Handling GET request with Request ID: ${requestId}`, 
    TEST_USER_ID, 
    requestId
  );
  
  try {
    // 2. Run the main database logic
    const rows = await db.jtemp.findMany();
    
    // Log the successful database operation. Must be AWAITED.
    await log.info(
      'Successfully fetched jtemp rows.', 
      TEST_USER_ID, 
      requestId, 
      { 
        rowCount: rows.length,
        ipAddress: request.headers.get('x-forwarded-for') 
      }
    );
    
    // Console log the data fetched
    console.log("jtemp rows:", rows);

    // 3. Return the response
    return NextResponse.json({ success: true, message: 'Logs generated and jtemp queried.', data: rows });

  } catch (error) {
    let errorMessage = 'An unknown error occurred during the test.';
    let errorStack = '';

    // 🎯 FIX: Safely check if the error is a standard Error object
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || '';
    }
    
    // 4. Log any errors encountered during the process. Must be AWAITED.
    await log.error(
      'An error occurred during jtemp fetch or logging.', 
      TEST_USER_ID, 
      requestId, 
      { 
        errorMessage: errorMessage,
        errorStack: errorStack 
      }
    );
    
    // Return an error response
    return NextResponse.json({ success: false, message: 'Process failed.', error: errorMessage }, { status: 500 });
  }
}