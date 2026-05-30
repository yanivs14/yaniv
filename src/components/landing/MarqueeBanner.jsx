import React from "react";

const items = [
  { label: "Mobility", icon: "◎" },
  { label: "Strength", icon: "◈" },
  { label: "Control", icon: "◇" },
  { label: "Longevity", icon: "∞" },
  { label: "Breath", icon: "○" },
  { label: "Movement", icon: "◉" },
];

export default function MarqueeBanner() {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-orange-red/5 border-y border-orange-red/20 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 mx-10 font-heading text-sm font-bold tracking-widest text-off-white/50 uppercase"
          >
            <span className="text-orange-red text-base">{item.icon}</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}