// app/notes/PublishToggle.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function UnpublishButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleUnpublish() {
    startTransition(async () => {
      await fetch(`/api/notes/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: false }),
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleUnpublish}
      disabled={pending}
      className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
    >
      {pending ? "Unpublishing..." : "Unpublish"}
    </button>
  );
}
