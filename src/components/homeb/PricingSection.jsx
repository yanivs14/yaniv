import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";
import { trackPricingViewed, track, getGaClientId } from "@/lib/analytics";
import { useSectionTracking } from "@/hooks/useSectionTracking";

let _checkoutInProgress = false;
async function startCheckout(plan) {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track('begin_checkout', { currency: 'USD', plan_type: plan, plan_options: ['monthly', 'annual', 'inner_circle'], page_state: 'pricing_section' });
    const res = await base44.functions.invoke("createCheckout", { plan, ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function PricingSection() {
  const { content } = useSiteContent();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const pricingRef = useSectionTracking("pricing");

  useEffect(() => {
    if (content?.pricing) {
      trackPricingViewed(["annual", "monthly", "inner_circle"], "pricing_section");
    }
  }, [content]);

  if (!content) return null;
  const c = content.pricing;

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan);
    await startCheckout(plan);
    setCheckoutLoading(null);
  };

  const monthlyFeatures = c.monthlyFeatures?.length ? c.monthlyFeatures : [
    "Full Movement training library (240+ sessions)",
    "Strength, mobility, control & longevity tracks",
    "Community access + challenges",
  ];

  const annualFeatures = c.annualFeatures?.length ? c.annualFeatures : [
    "Full Movement training library (240+ sessions)",
    "Strength, mobility, control & longevity tracks",
    "Community access + challenges",
    "Personalized plan for your goals",
    "Async check-ins & ongoing adjustments",
    "Priority support",
  ];

  const innerCircleFeatures = c.innerCircleFeatures?.length ? c.innerCircleFeatures : [
    "Personalized plan for your goals",
    "Async check-ins & ongoing adjustments",
    "Priority support",
    "Direct personal access to Roye",
    "Weekly live feedback sessions",
    "Ongoing adjustments as you progress",
  ];

  return (
    <section ref={pricingRef} className="py-12 lg:py-24 bg-dark-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight">
            {c.headline || "Three ways to train with Roye. Find the right fit."}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-dark-bg border border-dark-border rounded-2xl p-8 flex flex-col"
          >
            <p className="font-body text-sm font-bold text-off-white uppercase tracking-widest mb-4">Monthly Plan</p>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="font-heading text-5xl font-bold text-off-white">{c.monthlyPrice || "$35"}</span>
              <span className="font-body text-sm text-white-muted">/ mo</span>
            </div>
            <ul className="space-y-3 flex-1">
              {monthlyFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("monthly")}
              disabled={checkoutLoading === "monthly"}
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-6"
            >
              {checkoutLoading === "monthly" ? "Loading..." : <>{c.ctaMonthly || "Begin Monthly"} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>

          {/* Annual - Most Popular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark-bg border-2 border-orange-red rounded-2xl p-8 relative flex flex-col mt-6 md:mt-0"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-red text-dark-bg text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">Most Popular</span>
            <p className="font-body text-sm font-bold text-orange-red uppercase tracking-widest mb-4">Annual Plan</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-off-white">{c.annualMonthlyPrice || "$19.99"}</span>
              <span className="font-body text-sm text-white-muted">/ mo</span>
            </div>
            <p className="font-body text-xs text-white-muted mb-6">Billed annually ({c.annualPrice || "$239.88"}/yr)</p>
            <p className="font-body text-sm text-off-white/80 mb-3">Everything in Monthly, plus:</p>
            <ul className="space-y-3 flex-1">
              {annualFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("annual")}
              disabled={checkoutLoading === "annual"}
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-6"
            >
              {checkoutLoading === "annual" ? "Loading..." : <>{c.ctaAnnual || "Begin Annual"} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>

          {/* Inner Circle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-dark-bg border border-gold rounded-2xl p-8 relative flex flex-col mt-6 md:mt-0"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-dark-bg text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">Inner Circle — Applications Reviewed</span>
            <p className="font-body text-sm font-bold text-gold uppercase tracking-widest mb-4">Inner Circle</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-off-white">{c.innerCirclePrice || "Custom"}</span>
            </div>
            <p className="font-body text-xs text-white-muted mb-6">{c.innerCircleSubtitle || "Private consultation required"}</p>
            <p className="font-body text-sm text-off-white/80 mb-3">Everything in Annual, plus:</p>
            <ul className="space-y-3 flex-1">
              {innerCircleFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="/inner-circle"
              className="flex items-center justify-center gap-2 w-full bg-gold text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors mt-6"
            >
              {c.innerCircleCta || "Apply for Inner Circle"} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">No equipment required · Cancel any time</p>
      </div>
    </section>
  );
}