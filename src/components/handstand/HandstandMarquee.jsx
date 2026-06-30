import React from "react";

const items = [
  { label: "Mobility", icon: "◎" },
  { label: "Strength", icon: "◈" },
  { label: "Control", icon: "◇" },
  { label: "Balance", icon: "∞" },
  { label: "Breath", icon: "○" },
];

export default function HandstandMarquee() {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-dark-surface border-y border-dark-border py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-8 font-heading text-lg font-bold tracking-widest text-off-white uppercase"
          >
            <span className="text-orange-red text-base">{item.icon}</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}