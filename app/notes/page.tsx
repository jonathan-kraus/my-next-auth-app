import db from "@/lib/db";
import Link from "next/link";
import { UnpublishButton } from "./PublishToggle";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  // Only published notes
  const notes = await db.note.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  // Follow-ups due TODAY or earlier
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dueNotes = await db.note.count({
    where: {
      published: true,
      needsFollowUp: true,
      followUpDate: { lte: today },
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Published Notes ({notes.length})</h1>
        <Link
          href="/notes/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Note
        </Link>
      </div>

      {/* FOLLOW-UP DUE BAR */}
      {dueNotes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-red-900 text-lg">
                📅 {dueNotes} Follow-up(s) Due Today
              </h3>
              <p className="text-red-700 text-sm">
                Check notes needing attention
              </p>
            </div>
          </div>
          <Link
            href="/notes?due=today"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Review Due
          </Link>
        </div>
      )}

      {/* ALL PUBLISHED NOTES */}
      {notes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-2xl mb-4">No published notes yet</p>
          <Link
            href="/notes/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {notes.map((note) => {
            const isOverdue =
              note.needsFollowUp &&
              note.followUpDate &&
              new Date(note.followUpDate) <= new Date();

            return (
              <div
                key={note.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-semibold">{note.title}</h2>

                  {/* STATUS BADGES */}
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Published
                    </span>
                    {isOverdue && (
                      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 animate-pulse">
                        OVERDUE
                      </span>
                    )}
                    {note.needsFollowUp && !isOverdue && (
                      <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                        {note.followUpDate?.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {note.content.slice(0, 200)}...
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>By {note.author.name || note.author.email}</span>
                  <span>{note.createdAt.toLocaleDateString()}</span>
                  <UnpublishButton id={note.id} />
                  <Link
                    href={`/notes/${note.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
