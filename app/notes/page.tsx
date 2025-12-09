import db from "@/lib/db"
import Link from "next/link"

export default async function NotesPage() {
  const notes = await db.note.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Notes</h1>
        <Link href="/notes/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          + New Note
        </Link>
      </div>
      
      <div className="grid gap-6">
        {notes.map(note => (
          <div key={note.id} className="border rounded-lg p-6 hover:shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-semibold">{note.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${note.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {note.published ? 'Published' : 'Draft'}
              </span>
            </div>
            {note.needsFollowUp && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mb-4 inline-block">
                Follow-up: {note.followUpDate?.toDateString()}
              </span>
            )}
            <p className="text-gray-600 mb-4">{note.content.slice(0, 150)}...</p>
            <div className="text-sm text-gray-500 flex gap-4">
              <span>By {note.author.name || note.author.email}</span>
              <span>{note.createdAt.toLocaleDateString()}</span>
              <Link href={`/notes/${note.id}`} className="text-blue-600 hover:underline">
                Read more →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
