import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandFinalCTA({ c }) {
  const { isPreLaunch, priceDisplay, ctaText, secondaryCtaText, deliveryNote } = useHandstandOffer();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_final_cta");
    setLoading(false);
  };

  const scrollToAnnual = () => {
    document.getElementById("purchase")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-24 bg-dark-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-red/5 to-transparent" />
      <div className="relative max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {c?.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight mb-4 leading-[0.95]">
            <AccentText text={c?.headline} />
          </h2>
          <p className="font-body text-base text-white-muted mb-6 max-w-xl mx-auto leading-relaxed">{c?.subtitle}</p>
          {isPreLaunch && (
            <p className="font-body text-sm text-off-white mb-1">Pre-launch price: {priceDisplay} until August 2</p>
          )}
          {isPreLaunch && <p className="font-body text-sm text-white-muted mb-6">{deliveryNote}</p>}
          {!isPreLaunch && <div className="mb-6" />}
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 mb-3">
            <button
              onClick={handleCheckout}
              disabled={loading}
              data-cta-id="handstand_final_cta"
              className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 w-full sm:w-auto"
            >
              {loading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              onClick={scrollToAnnual}
              className="font-body text-sm font-semibold text-white-muted hover:text-orange-red transition-colors underline underline-offset-4"
            >
              {secondaryCtaText}
            </button>
          </div>
          <p className="font-body text-[11px] text-white-dim">{c?.microcopy}</p>
        </motion.div>
      </div>
    </section>
  );
}