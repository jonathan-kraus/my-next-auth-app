import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const note = await db.note.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published || false,
        needsFollowUp: data.needsFollowUp || false,
        followUpDate: data.needsFollowUp ? new Date(data.followUpDate) : null,
        followUpNotes: data.followUpNotes || null,
        authorId: data.authorId, // REQUIRED - must be valid User.id
      }
    })
    
    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
