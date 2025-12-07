// app/api/jtemp/route.ts

import { NextResponse } from 'next/server';
// Ensure this path points to your correctly configured database client (db)
import db from "@/lib/db"; 

export async function GET() {
  try {
    // 1. Fetch all records from the jtemp table
    const data = await db.jtemp.findMany();

    // 2. Return the data as a JSON response
    return NextResponse.json({
      message: "Data fetched successfully from jtemp table.",
      data: data,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching jtemp data:", error);

    // 3. Handle and log any errors during the database query
    return NextResponse.json({
      message: "Failed to fetch data from jtemp table.",
      error: error.message,
    }, { status: 500 });
  }
}