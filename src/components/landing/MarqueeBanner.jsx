import React from "react";

const items = [
  { label: "Mobility", icon: "◎" },
  { label: "Strength", icon: "◈" },
  { label: "Control", icon: "◇" },
  { label: "Longevity", icon: "∞" },
  { label: "Breath", icon: "○" },
];

export default function MarqueeBanner() {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-cream border-y border-cream-dark/50 py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-8 font-body text-sm tracking-wide text-text-muted-warm"
          >
            <span className="text-orange-red text-base">{item.icon}</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}