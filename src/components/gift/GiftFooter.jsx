import React from "react";

const POLICY_PAGES = [
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "consumer-health-statement", label: "Consumer Health Statement" },
  { slug: "terms-of-use", label: "Terms of Use" },
];

export default function GiftFooter({ c }) {
  const copyright = (c?.copyright || "").replace("{year}", new Date().getFullYear());
  return (
    <footer className="bg-dark-bg border-t border-dark-border">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col items-center text-center gap-5">
        <p className="font-heading text-lg font-bold text-off-white uppercase tracking-widest">
          {c?.brand || "The Movement by Roye Gold"}
        </p>
        <nav className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
          {POLICY_PAGES.map((p) => (
            <a
              key={p.slug}
              href={`/${p.slug}`}
              className="font-body text-xs text-white-dim hover:text-off-white transition-colors underline underline-offset-4"
            >
              {p.label}
            </a>
          ))}
        </nav>
        <p className="font-body text-xs text-white-dim">{copyright}</p>
      </div>
    </footer>
  );
}