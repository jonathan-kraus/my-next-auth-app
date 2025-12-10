"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";

export default function NewNote() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
    needsFollowUp: false,
    followUpDate: "",
    followUpNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const authorId = session?.user?.id as string | undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (status === "loading") {
      toast.error("Still loading session, please wait.");
      return;
    }

    if (!authorId) {
      toast.error("No logged-in user found. Please sign in first.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          authorId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to create note.");
        return;
      }

      toast.success("Note created successfully!");
      router.push("/notes");
      router.refresh();
    } catch (err) {
      toast.error("Network error while creating note.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">New Note</h1>

        {/* Debug / status bar */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 text-sm text-blue-900 flex flex-wrap gap-3 items-center">
          <span className="font-semibold">Auth status:</span>
          <span className="px-2 py-1 rounded bg-white border">
            {status}
          </span>
          <span className="ml-4 font-semibold">User ID:</span>
          <code className="px-2 py-1 rounded bg-white border">
            {authorId ?? "none"}
          </code>
        </div>

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
                  setFormData({
                    ...formData,
                    needsFollowUp: e.target.checked,
                  })
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
            disabled={submitting || status !== "authenticated"}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Note"}
          </button>
        </form>
      </div>
    </>
  );
}
