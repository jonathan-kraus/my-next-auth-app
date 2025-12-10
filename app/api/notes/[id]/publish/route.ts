import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { published } = await req.json();

    const note = await db.note.update({
      where: { id: Number(params.id) },
      data: { published: !!published },
    });

    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update published state" },
      { status: 500 }
    );
  }
}
