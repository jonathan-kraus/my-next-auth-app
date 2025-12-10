// app/api/logs/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
export async function GET() {
  const logs = await db.log.findMany({
    orderBy: { timestamp: "desc" },
    take: 150, // limit for performance
  });
  return NextResponse.json(logs);
}
