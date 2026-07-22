import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout, startAnnualCheckout } from "@/lib/handstandCheckout";
import AccentText from "@/components/handstand/AccentText";

export default function PurchaseOptions({ c }) {
  const { isPreLaunch, priceDisplay, nextPriceDisplay, ctaText, deliveryNote } = useHandstandOffer();
  const [standaloneLoading, setStandaloneLoading] = useState(false);
  const [annualLoading, setAnnualLoading] = useState(false);

  if (!c) return null;
  const s = c.standalone || {};
  const a = c.annual || {};

  const handleStandalone = async () => {
    setStandaloneLoading(true);
    await startStandaloneCheckout("handstand_purchase_options");
    setStandaloneLoading(false);
  };

  const handleAnnual = async () => {
    setAnnualLoading(true);
    await startAnnualCheckout("handstand_purchase_options");
    setAnnualLoading(false);
  };

  return (
    <section id="purchase" className="py-14 lg:py-20 bg-dark-bg">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {c.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95] mb-3">
            <AccentText text={c.headline} />
          </h2>
          <p className="font-body text-sm lg:text-base text-white-muted max-w-xl mx-auto leading-relaxed">{c.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto items-start">
          {/* Standalone Course — Primary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark-surface border-2 border-orange-red rounded-2xl p-6 lg:p-8 relative lg:scale-[1.02]"
          >
            <p className="font-body text-[11px] font-bold text-orange-red uppercase tracking-widest mb-2">{s.label}</p>
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-off-white uppercase tracking-tight mb-5">{s.title}</h3>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-heading text-5xl lg:text-6xl font-bold text-off-white">{priceDisplay}</span>
              {isPreLaunch && (
                <span className="font-body text-sm text-white-dim line-through">{nextPriceDisplay}</span>
              )}
            </div>
            <p className="font-body text-xs text-white-muted mb-6">
              {isPreLaunch ? `Pre-launch price · ${nextPriceDisplay} from August 3` : "One-time payment"}
            </p>
            <ul className="space-y-2.5 mb-7">
              {(s.features || []).map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/90 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleStandalone}
              disabled={standaloneLoading}
              data-cta-id="handstand_standalone_cta"
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
            >
              {standaloneLoading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="mt-4 text-center font-body text-[11px] text-white-dim">{s.microcopy}</p>
            {isPreLaunch && <p className="mt-1 text-center font-body text-[11px] text-white-dim">{deliveryNote}</p>}
          </motion.div>

          {/* Annual Membership — Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-dark-surface border border-dark-border rounded-2xl p-6 lg:p-8 relative"
          >
            {a.badge && (
              <span className="absolute -top-3 left-6 bg-dark-bg border border-orange-red/40 text-orange-red text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {a.badge}
              </span>
            )}
            {a.eyebrow && <p className="font-body text-[11px] font-bold text-white-dim uppercase tracking-widest mb-2 mt-1">{a.eyebrow}</p>}
            <h3 className="font-heading text-xl lg:text-2xl font-bold text-off-white uppercase tracking-tight mb-4 leading-tight">{a.title}</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl lg:text-5xl font-bold text-off-white">{a.priceMonthly}</span>
            </div>
            <p className="font-body text-xs text-white-muted mb-4">{a.priceNote}</p>
            <p className="font-body text-sm text-white-muted leading-relaxed mb-5">{a.valueStatement}</p>
            <ul className="space-y-2.5 mb-7">
              {(a.features || []).map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleAnnual}
              disabled={annualLoading}
              data-cta-id="handstand_annual_cta"
              className="flex items-center justify-center gap-2 w-full border-2 border-orange-red text-orange-red font-body text-sm font-bold py-4 rounded-full hover:bg-orange-red/10 transition-colors disabled:opacity-60"
            >
              {annualLoading ? "Loading..." : <>{a.ctaText} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <div className="mt-4 flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-white-dim flex-shrink-0 mt-0.5" />
              <p className="font-body text-[11px] text-white-dim leading-relaxed">{a.disclosure}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}