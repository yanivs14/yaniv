import React from "react";

export default function HandstandSocialProof({ c }) {
  if (!c?.items?.length) return null;
  return (
    <section className="py-10 lg:py-16 bg-dark-bg">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-8">
          {c.headline && <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-2">{c.headline}</h2>}
          {c.subtitle && <p className="font-body text-sm lg:text-base text-white-muted">{c.subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {c.items.map((t, i) => (
            <div key={i} className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex flex-col">
              {t.img && <img src={t.img} alt={t.name} className="w-full h-40 object-cover rounded-xl mb-4" />}
              <p className="font-body text-sm text-off-white leading-relaxed italic mb-4 flex-1">"{t.quote}"</p>
              <div>
                <p className="font-body text-sm font-semibold text-off-white">{t.name}</p>
                {t.level && <p className="font-body text-xs text-orange-red">{t.level}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}