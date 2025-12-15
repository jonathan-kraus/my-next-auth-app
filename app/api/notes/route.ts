import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { createRequestId } from "@/lib/uuidj";

const log = createLogger("Notes_API");
const requestId = createRequestId();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
// Client-side Zod validation
      const schema = z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string().min(1, 'Content is required'),
        published: z.boolean().optional(),
        needsFollowUp: z.boolean().optional(),
        authorId: z.string().min(1, 'Author Id is required'),
        followUpDate: z.string().optional(),
        followUpNotes: z.string().optional(),
      });
            const values = {
        title: data.title as string,
        content: data.content as string,
        published: data.published === 'true',
        needsFollowUp: data.needsFollowUp === 'true',
        authorId: data.authorId as string,
        followUpDate: data.followUpDate as string,
        followUpNotes: data.followUpNotes as string,
      };
      const parsed = schema.safeParse(values);
      if (parsed.success) {
        // log fields
        console.log('Parsed data:', parsed.data);
      } else {
        console.log('Validation errors:', parsed.error.format());
        return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
      }
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