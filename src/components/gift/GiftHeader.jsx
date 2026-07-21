import React from "react";

export default function GiftHeader({ c }) {
  if (!c) return null;
  return (
    <header className="sticky top-0 z-30 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <a href="#top" className="font-heading text-lg font-bold text-off-white uppercase tracking-widest">
          {c.brand || "The Movement"}
        </a>
        <a
          href="#membership"
          className="font-body text-xs font-semibold text-off-white hover:text-orange-red transition-colors uppercase tracking-wide"
        >
          {c.ctaText || "Membership"}
        </a>
      </div>
    </header>
  );
}