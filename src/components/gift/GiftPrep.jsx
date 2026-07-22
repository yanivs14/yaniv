import React from "react";

export default function GiftPrep({ c }) {
  if (!c?.items?.length) return null;
  return (
    <section className="bg-dark-bg pb-8 lg:pb-10">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 bg-dark-surface border border-dark-border rounded-2xl p-4 lg:p-5">
          {c.items.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
              {i > 0 && <span className="hidden sm:block w-px self-stretch bg-dark-border" />}
              <div className="flex-1">
                <p className="font-heading text-sm font-bold text-orange-red uppercase tracking-tight">{item.title}</p>
                <p className="font-body text-xs text-white-muted leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}