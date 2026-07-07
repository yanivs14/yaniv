import React from "react";
import { Clock } from "lucide-react";

export default function CacheTimestamp({ cachedAt }) {
  if (!cachedAt) return null;
  const date = new Date(cachedAt);
  const formatted = date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-body" title={`Last live update: ${formatted}`}>
      <Clock className="w-3 h-3" />
      {formatted}
    </span>
  );
}