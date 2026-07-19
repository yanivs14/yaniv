import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCountdown } from "@/components/handstand/preorder/PreOrderCountdown";

function DarkCountdown({ targetDate }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  if (expired || !targetDate) return null;
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <div className="bg-dark-surface border border-orange-red/30 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 text-center min-w-[56px] sm:min-w-[80px]">
            <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-red tabular-nums leading-none">
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white-muted mt-1">{u.label}</div>
          </div>
          {i < units.length - 1 && <span className="font-heading text-xl sm:text-2xl text-white-dim -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function HandstandHero({ c, targetDate }) {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-4 lg:pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {c?.imageUrl && (
          <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/15 via-dark-bg/15 to-dark-bg" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {c?.eyebrow && (
            <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">{c.eyebrow}</p>
          )}
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.9] text-off-white uppercase tracking-tight mb-6">
            {c?.headline1}<br />
            {c?.headline2}<br />
            <span className="text-orange-red">{c?.headlineAccent}</span>
          </h1>
          {c?.boldDescription && (
            <p className="font-heading text-xl sm:text-2xl font-bold text-off-white leading-tight mb-4">
              {c.boldDescription}
            </p>
          )}
          <p className="font-body text-lg text-white-muted mb-8 max-w-xl leading-relaxed">{c?.subheadline}</p>

          {targetDate && (
            <div className="mb-8">
              <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-orange-red mb-3">
                Special Price · Limited Time
              </p>
              <DarkCountdown targetDate={targetDate} />
            </div>
          )}

          <button
            onClick={scrollToPricing}
            data-cta-id="handstand_hero_cta"
            className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-base font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c?.ctaText} <ArrowRight className="w-5 h-5" />
          </button>
          {c?.ctaSubtext && (
            <p className="mt-4 font-body text-sm text-white-dim">{c.ctaSubtext}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}