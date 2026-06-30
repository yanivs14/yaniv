import React from "react";

const logos = [
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3 L25 23 L3 23 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 11 L14 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    name: "PEAK",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 24 L14 4 M6 12 L14 4 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    name: "RISE",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M3 14 C7 8, 11 8, 14 14 C17 20, 21 20, 25 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 20 C7 14, 11 14, 14 20 C17 26, 21 26, 25 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    name: "FLOW",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3 L25 14 L14 25 L3 14 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 9 L19 14 L14 19 L9 14 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
    name: "APEX",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3 L24 8.5 L24 19.5 L14 25 L4 19.5 L4 8.5 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    name: "CORE",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M16 3 L7 16 L13 16 L11 25 L21 12 L15 12 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    name: "VOLT",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="5" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="10" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      </svg>
    ),
    name: "FORM",
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M21 4 C21 16, 16 21, 4 21 M21 4 L21 10 M21 4 L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 7 C18 14, 14 18, 7 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    name: "PRIMAL",
  },
];

export default function HandstandMarquee() {
  const repeated = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="bg-dark-bg border-y border-dark-border py-6 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap items-center">
        {repeated.map((logo, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2.5 mx-10 text-white-dim hover:text-off-white transition-colors duration-300"
          >
            {logo.svg}
            <span className="font-heading text-xl font-bold tracking-wider uppercase">{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}