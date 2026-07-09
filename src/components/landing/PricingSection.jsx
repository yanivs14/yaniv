import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, X } from "lucide-react";
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

function PriceSplit({ price, className = "", small = false }) {
  const str = String(price || "");
  const dotIdx = str.indexOf(".");
  if (dotIdx === -1) {
    return <span className={`font-heading ${small ? "text-xl" : "text-4xl"} font-bold ${className}`}>{str}</span>;
  }
  const main = str.slice(0, dotIdx);
  const cents = str.slice(dotIdx);
  return (
    <span className={`font-heading ${small ? "text-xl" : "text-4xl"} font-bold ${className} flex items-baseline`}>
      {main}
      <span className={`${small ? "text-sm" : "text-lg"} font-bold`}>{cents}</span>
    </span>
  );
}

const DEFAULT_GENERAL_FEATURES = [
  "Personalized adaptive daily practice",
  "Full Movement training library (240+ sessions)",
  "Strength, mobility, control & longevity tracks",
  "Community access + challenges",
];

const DEFAULT_PREMIUM_FEATURES = [
  "Everything in General, plus:",
  "Personalized plan for your body & goals",
  "Weekly live feedback with Roye",
  "Ongoing adjustments as you progress",
  "Direct support, every step",
  "Limited spots - serious members only",
];

function ModalMonthlyCard({ c, onSelect, loading }) {
  const features = c.monthlyFeatures?.length ? c.monthlyFeatures : [
    "Personalized adaptive daily practice",
    "Full Movement training library (240+ sessions)",
    "Strength, mobility, control & longevity tracks",
    "Community access + challenges",
  ];
  return (
    <div className="bg-dark-bg border border-dark-border rounded-2xl p-6 flex flex-col">
      <p className="font-body text-sm text-white-muted mb-1">Monthly</p>
      <div className="flex items-baseline gap-1 my-2">
        <PriceSplit price={c.monthlyPrice} className="text-off-white" />
        <span className="font-body text-sm text-white-muted">/ month</span>
      </div>
      {c.monthlySubtitle && <p className="font-body text-xs text-white-muted mb-4 leading-relaxed">{c.monthlySubtitle}</p>}
      <ul className="space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
            <span className="font-body text-sm text-off-white/80">{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={onSelect} disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-5">
        {loading ? "Loading..." : <>{c.ctaMonthly} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

function ModalAnnualCard({ c, onSelect, loading }) {
  const features = c.annualFeatures?.length ? c.annualFeatures : [
    "Everything in Monthly, plus:",
    "Weekly live coaching & feedback",
    "Exclusive member-only trainings",
    "Advanced content drops",
    "Priority access to new releases",
    "Annual member perks & content",
  ];
  return (
    <div className="bg-orange-red border border-orange-red rounded-2xl p-6 relative flex flex-col">
      <span className="absolute top-3 right-3 font-heading text-xs font-bold text-dark-bg bg-dark-bg/15 px-3 py-1 rounded-full uppercase">{c.annualInsteadOf}</span>
      <p className="font-body text-sm text-dark-bg/70 mb-1">Annual</p>
      <div className="flex items-baseline gap-1.5 my-2">
        <PriceSplit price={c.annualMonthlyPrice} className="text-dark-bg" />
        <span className="font-body text-sm text-dark-bg/60">/ month</span>
      </div>
      <p className="font-body text-sm text-dark-bg mb-1">
        <PriceSplit price={c.annualPrice} className="text-dark-bg" small /> / year billed annually
      </p>
      <p className="font-body text-xs font-bold text-dark-bg mb-1 bg-dark-bg/20 w-fit px-3 py-1 rounded-full">{c.annualSavings}</p>
      {c.annualSubtitle && <p className="font-body text-xs text-dark-bg/80 mb-4 mt-2 leading-relaxed">{c.annualSubtitle}</p>}
      <ul className="space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
            <span className={`font-body text-sm text-dark-bg/90 ${i === 0 || i === 1 ? "font-bold" : ""}`}>{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={onSelect} disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface transition-colors disabled:opacity-60 mt-4">
        {loading ? "Loading..." : <>{c.ctaAnnual} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

export default function PricingSection() {
  const { content } = useSiteContent();
  const [modalOpen, setModalOpen] = useState(false);
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

  const generalFeatures = c.monthlyFeatures?.length ? c.monthlyFeatures : DEFAULT_GENERAL_FEATURES;
  const premiumExtras = (c.innerCircleFeatures?.length ? c.innerCircleFeatures : DEFAULT_PREMIUM_FEATURES)
    .filter(f => !f.toLowerCase().startsWith("everything in"));

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
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.headline1}<br />
            {c.headline2} <span className="text-orange-red">{c.headlineAccent}</span>
          </h2>
          <p className="mt-4 font-body text-base text-white-muted">{c.subtitle}</p>
        </motion.div>

        {/* Two tracks */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Regular Track */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-dark-bg border border-dark-border rounded-2xl p-8 flex flex-col"
          >
            <p className="font-body text-sm text-white-muted mb-1">Regular</p>
            <h3 className="font-heading text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-3">Regular Track</h3>
            <p className="font-body text-sm text-white-muted mb-6 leading-relaxed">Full access to the Movement library, daily practice, and community.</p>
            <ul className="space-y-2.5 flex-1">
              {generalFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80">{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors mt-6">
              Choose Regular <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Premium Track */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark-bg border border-dark-border rounded-2xl p-8 flex flex-col"
          >
            <p className="font-body text-sm text-orange-red mb-1">Premium</p>
            <h3 className="font-heading text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-3">Premium Track</h3>
            <p className="font-body text-sm text-white-muted mb-6 leading-relaxed">{c.innerCircleDescription || "The most personal experience we offer — Roye's direct guidance, every step of the way."}</p>
            <ul className="space-y-2.5 flex-1">
              {generalFeatures.map((f, i) => (
                <li key={`g-${i}`} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-off-white flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80">{f}</span>
                </li>
              ))}
              {premiumExtras.map((f, i) => (
                <li key={`p-${i}`} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-off-white flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80">{f}</span>
                </li>
              ))}
            </ul>
            <a href="/inner-circle"
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors mt-6">
              {c.innerCircleCta || "Apply to Inner Circle"} <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">No equipment required · Cancel any time</p>
      </div>

      {/* Modal: Monthly vs Annual */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-3xl"
            >
              <button onClick={() => setModalOpen(false)}
                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-white-muted hover:text-off-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="grid sm:grid-cols-2 gap-4">
                <ModalAnnualCard c={c} onSelect={() => handleCheckout("annual")} loading={checkoutLoading === "annual"} />
                <ModalMonthlyCard c={c} onSelect={() => handleCheckout("monthly")} loading={checkoutLoading === "monthly"} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}