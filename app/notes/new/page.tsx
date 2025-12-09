"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

export default function NewNote() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
    needsFollowUp: false,
    followUpDate: "",
    followUpNotes: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    //const res = await fetch('/api/users')  // ← Uses your db.user.findMany()
    //const users = await res.json()
    //setAuthorId(users[0].id)  // Gets real user ID
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        authorId: "cmiz0p9ro000004ldrxgn3a1c",
      }),
    });

    if (res.ok) {
      router.push("/notes");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">New Note</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={8}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
            />
            Published
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.needsFollowUp}
              onChange={(e) =>
                setFormData({ ...formData, needsFollowUp: e.target.checked })
              }
            />
            Needs Follow-up
          </label>
        </div>

        {formData.needsFollowUp && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData({ ...formData, followUpDate: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />
            <textarea
              placeholder="Follow-up notes..."
              value={formData.followUpNotes}
              onChange={(e) =>
                setFormData({ ...formData, followUpNotes: e.target.value })
              }
              rows={3}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Note
        </button>
      </form>
    </div>
  );
}
