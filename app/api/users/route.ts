// app/api/users/route.ts
export const runtime = "nodejs";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}
