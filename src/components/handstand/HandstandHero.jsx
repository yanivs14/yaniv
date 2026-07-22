import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";
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
          <div className="bg-gradient-to-b from-dark-surface to-black/60 border border-orange-red/25 rounded-xl px-3 py-2.5 sm:px-5 sm:py-3 text-center min-w-[58px] sm:min-w-[84px] shadow-[0_4px_24px_-8px_rgba(0,255,247,0.35)] backdrop-blur-sm">
            <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-red tabular-nums leading-none">
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white-muted mt-1.5">{u.label}</div>
          </div>
          {i < units.length - 1 && (
            <span className="flex flex-col items-center justify-center gap-1.5 -mx-0.5">
              <span className="w-1 h-1 rounded-full bg-orange-red/50" />
              <span className="w-1 h-1 rounded-full bg-orange-red/50" />
            </span>
          )}
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
    <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        {c?.imageUrl && (
          <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/15 via-dark-bg/15 to-dark-bg" />
      </div>
      {(c?.eyebrow || targetDate) && (
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full pt-4 lg:pt-6">
          {c?.eyebrow && (
            <p className="font-body text-xs sm:text-sm text-orange-red uppercase tracking-wider sm:tracking-widest mb-3 leading-relaxed">
              {c.eyebrow}
            </p>
          )}
          {targetDate && <DarkCountdown targetDate={targetDate} />}
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full flex-1 flex items-center py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] sm:leading-[0.95] text-off-white uppercase tracking-tight mb-6">
            {c?.headline1}{" "}
            {c?.headlineAccent ? c?.headline2 : <AccentText text={c?.headline2} />}
            {c?.headlineAccent && (
              <>
                <br />
                <span className="text-orange-red">{c?.headlineAccent}</span>
              </>
            )}
          </h1>
          {c?.boldDescription && (
            <p className="font-heading text-xl sm:text-2xl font-bold text-white leading-tight mb-4">
              {c.boldDescription}
            </p>
          )}
          <p className="font-body text-lg text-white mb-8 max-w-xl leading-relaxed">{c?.subheadline}</p>

          <button
            onClick={scrollToPricing}
            data-cta-id="handstand_hero_cta"
            className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-base font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c?.ctaText} <ArrowRight className="w-5 h-5" />
          </button>
          {c?.ctaSubtext && (
            <div className="mt-5 inline-flex items-center gap-2 bg-dark-surface/70 border border-dark-border rounded-full px-4 py-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-red" />
              <span className="font-body text-xs text-white-muted">{c.ctaSubtext}</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}