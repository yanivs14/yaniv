import React from "react";

const FEATURES = [
  { text: "Lifetime Access", gradient: "from-teal-400 to-cyan-500" },
  { text: "One-time Payment", gradient: "from-blue-400 to-indigo-500" },
  { text: "Save 34%", gradient: "from-purple-400 to-pink-500" },
  { text: "Early Access", gradient: "from-amber-400 to-orange-500" },
  { text: "40+ Video Lessons", gradient: "from-green-400 to-teal-500" },
  { text: "Step-by-Step", gradient: "from-rose-400 to-red-500" },
  { text: "Pre-Order Now", gradient: "from-cyan-400 to-blue-500" },
  { text: "Lowest Price Ever", gradient: "from-violet-400 to-purple-500" },
];

export default function PreOrderScroller() {
  return (
    <div className="mt-10 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
        {[...FEATURES, ...FEATURES].map((f, i) => (
          <div key={i} className="group/card relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden mx-1.5">
            <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} scale-150 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 transition-all duration-300`} />
            <span className="relative font-body text-[12px] font-semibold text-[#0a1b33] group-hover/card:text-white transition-colors">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}