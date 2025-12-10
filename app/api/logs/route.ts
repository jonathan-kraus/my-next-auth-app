// app/api/logs/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const userId = searchParams.get("userId");

  const logs = await db.log.findMany({
    where: {
      ...(severity ? { severity: { equals: severity, mode: "insensitive" } } : {}),
      ...(userId ? { userId: { equals: userId, mode: "insensitive" } } : {}),
    },
    orderBy: { timestamp: "desc" },
    take: 150,
  });

  return NextResponse.json(logs);
}
