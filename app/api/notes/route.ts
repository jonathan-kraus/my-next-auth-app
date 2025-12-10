import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { createLogger } from "@/lib/logger";
import { createRequestId } from "@/lib/uuidj";

const log = createLogger("Notes_API");
const requestId = createRequestId();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const note = await db.note.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published || false,
        needsFollowUp: data.needsFollowUp || false,
        followUpDate: data.needsFollowUp ? new Date(data.followUpDate) : null,
        followUpNotes: data.followUpNotes || null,
        authorId: data.authorId, // REQUIRED - must be valid User.id
      },
    });
    console.log("note created");
    await log.info("New Note created successfully.", data.authorId, requestId, {
      title: data.title,
      content: data.content,
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 },
    );
  }
}
