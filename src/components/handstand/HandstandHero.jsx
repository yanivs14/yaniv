import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";
import AccentText from "@/components/handstand/AccentText";

function HeroCountdown({ label }) {
  const { countdown, isPreLaunch } = useHandstandOffer();
  if (!isPreLaunch) return null;
  const { days, hours, minutes, seconds } = countdown;
  return (
    <div className="inline-flex items-center gap-1.5 bg-dark-surface/80 border border-orange-red/25 rounded-full px-3 py-1.5 backdrop-blur-sm">
      <span className="font-body text-[10px] text-white-dim uppercase tracking-wide">{label}</span>
      <span className="font-heading text-xs font-bold text-orange-red tabular-nums">
        {days}d {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}

export default function HandstandHero({ c, t = {} }) {
  const { isPreLaunch, priceDisplay, nextPriceDisplay, ctaText, microcopy, offerLabel, preLaunchLabel, deliveryNote, heroCountdownLabel, nextPriceNote, alsoIncludedText } = useHandstandOffer(t);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_hero");
    setLoading(false);
  };

  return (
    <section id="hero" className="relative min-h-[75vh] lg:min-h-screen flex flex-col overflow-hidden pt-10 lg:pt-11">
      <div className="absolute inset-0 z-0">
        {c?.imageUrl && <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-dark-bg" />
      </div>
      <div className="relative z-10 max-w-[1250px] mx-auto px-6 lg:px-10 w-full flex-1 flex items-center py-6 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {c?.eyebrow && (
            <p className="font-body text-[11px] text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>
          )}
          {isPreLaunch && preLaunchLabel && (
            <div className="inline-flex items-center gap-2 bg-orange-red/10 border border-orange-red/30 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-red animate-pulse" />
              <span className="font-body text-[10px] text-orange-red font-bold uppercase tracking-wider">{preLaunchLabel}</span>
            </div>
          )}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.0] sm:leading-[0.95] text-off-white uppercase tracking-tight mb-4">
            {c?.headline1}
            {c?.headline2 && (
              <>
                <br />
                <AccentText text={c.headline2} />
              </>
            )}
          </h1>
          <p className="font-body text-base lg:text-lg text-white-muted leading-[1.5] mb-5 max-w-xl">{c?.supporting}</p>

          {/* Compact offer block */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <div>
              <p className="font-body text-[10px] text-white-dim uppercase tracking-widest mb-0.5">{offerLabel}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl lg:text-5xl font-bold text-orange-red">{priceDisplay}</span>
                {isPreLaunch && <span className="font-body text-sm text-white-dim line-through">{nextPriceDisplay}</span>}
              </div>
            </div>
            {isPreLaunch && (
              <div className="flex flex-col gap-0.5">
                <span className="font-body text-xs text-white-muted">{nextPriceNote}</span>
                <span className="font-body text-xs text-white-dim">{deliveryNote}</span>
              </div>
            )}
            <HeroCountdown label={heroCountdownLabel} />
          </div>

          {/* Primary CTA only */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <button
              onClick={handleCheckout}
              disabled={loading}
              id="hero-cta"
              data-cta-id="handstand_hero_cta"
              className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-7 py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 w-full sm:w-auto"
            >
              {loading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
          <p className="font-body text-[11px] text-white-dim mb-1.5">{microcopy}</p>
          <p className="font-body text-xs text-white-muted">{alsoIncludedText}</p>
        </motion.div>
      </div>
    </section>
  );
}