// app/notes/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

export default async function NoteDetail({
  params,
}: {
  params: { id: string };
}) {
  const note = await db.note.findUnique({
    where: { id: Number(params.id) },
    include: { author: true },
  });

  if (!note) return notFound();

  // render full note here...
}
