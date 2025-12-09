// app/api/jtemp/route.ts

import { NextResponse } from "next/server";
// Ensure this path points to your correctly configured database client (db)
import db from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  try {
    // 1. Fetch all records from the jtemp table
    const data = await db.jtemp.findMany();

    // 2. Return the data as a JSON response
    return NextResponse.json(
      {
        message: "Data fetched successfully from jtemp table",
        data: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching jtemp data:", error);

    // --- MUST USE THIS SAFE TYPE CHECK ---
    let errorMessage = "An unknown error occurred.";
    // Check if the error object is an instance of the built-in Error class
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Otherwise, try to safely check for a message property if it's an object
    else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      errorMessage = (error as { message: string }).message;
    }
    // ------------------------------------

    return NextResponse.json(
      {
        message: "Failed to fetch data from jtemp table.",
        error: errorMessage, // 👈 Now using the safe variable
      },
      { status: 500 },
    );
  }
}
