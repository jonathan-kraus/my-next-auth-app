// app/logs/LiveToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 30_000; // 30 seconds

export function LiveToggle() {
  const [isLive, setIsLive] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLive) return;

    const id = setInterval(() => {
      router.refresh(); // re-runs LogsPage and refetches logs
    }, POLL_MS);

    return () => clearInterval(id);
  }, [isLive, router]);

  const handleClick = () => {
    setIsLive((v) => !v);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition " +
        (isLive
          ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/50"
          : "bg-slate-800/80 text-slate-300 ring-1 ring-slate-700/80")
      }
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
      {isLive ? "Live view (30s)" : "Paused"}
    </button>
  );
}
