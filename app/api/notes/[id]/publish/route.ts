import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // note: Promise
) {
  const { id } = await context.params; // await the params
  try {
    const { published } = await request.json();

    const note = await db.note.update({
      where: { id: Number(id) },
      data: { published: !!published },
    });

    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update published state' },
      { status: 500 }
    );
  }
}
