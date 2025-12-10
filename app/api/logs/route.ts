// app/api/logs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const userId = searchParams.get("userId");

  const logs = await prisma.log.findMany({
    where: {
      ...(severity ? { severity } : {}),
      ...(userId ? { userId } : {}),
    },
    orderBy: { timestamp: "desc" },
    take: 150,
  });

  return NextResponse.json(logs);
}
