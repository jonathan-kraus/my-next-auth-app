// app/logs/LiveToggle.tsx
"use client";

import { useState } from "react";
import { createRequestId } from "@/lib/logger";

const requestId = createRequestId();
console.log("LiveToggle requestId:", requestId);
export function LiveToggle() {
  const [isLive, setIsLive] = useState(true);

  const handleClick = () => {
    setIsLive((v) => !v);
    // fire-and-forget; do not await in an event handler
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
      {isLive ? "Live view" : "Paused"}
    </button>
  );
}
