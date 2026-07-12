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

const REGULAR_FEATURES = [
  "Full Movement training library (240+ sessions)",
  "Strength, mobility, control & longevity tracks",
  "Community access + challenges",
];
const PREMIUM_FEATURES = [
  "Personalized plan for your goals",
  "Async check-ins & ongoing adjustments",
  "Priority support",
];
const INNER_CIRCLE_FEATURES = [
  "Direct personal access to Roye",
  "Weekly live feedback sessions",
  "Ongoing adjustments as you progress",
];
const GOLD = "#D4AF37";

function PriceDisplay({ billing, monthlyPrice, annualMonthlyPrice, className }) {
  if (billing === "annual") {
    return (
      <div className="flex items-baseline gap-1.5 my-3">
        <span className={`font-heading text-3xl lg:text-4xl font-bold ${className}`}>{annualMonthlyPrice}</span>
        <span className="font-body text-sm text-white-muted">/ mo</span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-1.5 my-3">
      <span className={`font-heading text-3xl lg:text-4xl font-bold ${className}`}>{monthlyPrice}</span>
      <span className="font-body text-sm text-white-muted">/ mo</span>
    </div>
  );
}

function CheckItem({ children, color = "text-orange-red", style }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} style={style} />
      <span className="font-body text-sm text-off-white/80">{children}</span>
    </li>
  );
}

export default function PricingSection() {
  const { content } = useSiteContent();
  const [billing, setBilling] = useState("annual");
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const pricingRef = useSectionTracking("pricing");

  useEffect(() => {
    if (content?.pricing) trackPricingViewed(["annual", "monthly", "inner_circle"], "pricing_section");
  }, [content]);

  if (!content) return null;
  const c = content.pricing;

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan);
    await startCheckout(plan);
    setCheckoutLoading(null);
  };

  const regularFeatures = c.regularFeatures?.length ? c.regularFeatures : REGULAR_FEATURES;
  const premiumFeatures = c.premiumFeatures?.length ? c.premiumFeatures : PREMIUM_FEATURES;
  const innerCircleFeatures = c.innerCircleFeatures?.length ? c.innerCircleFeatures : INNER_CIRCLE_FEATURES;
  const monthlyPrice = c.monthlyPrice || "$35";
  const annualMonthlyPrice = c.annualMonthlyPrice || "$19.99";
  const savingsBadge = c.savingsBadge || "Save 40%";
  const ctaLabel = billing === "annual" ? (c.ctaAnnual || "Begin Annual") : (c.ctaMonthly || "Begin Monthly");

  return (
    <section ref={pricingRef} className="py-12 lg:py-24 bg-dark-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {c.eyebrow && <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>}
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.headline1 || "Memberships"}
          </h2>
          <p className="mt-4 font-body text-base text-white-muted">{c.subtitle}</p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-colors ${billing === "monthly" ? "bg-off-white text-dark-bg" : "bg-dark-bg border border-dark-border text-white-muted hover:text-off-white"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-6 py-2.5 rounded-full font-body text-sm font-semibold transition-colors flex items-center gap-2 ${billing === "annual" ? "bg-off-white text-dark-bg" : "bg-dark-bg border border-dark-border text-white-muted hover:text-off-white"}`}
          >
            Annual
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${billing === "annual" ? "bg-orange-red text-dark-bg" : "bg-orange-red/20 text-orange-red"}`}>
              {savingsBadge}
            </span>
          </button>
        </div>

        {/* Three cards: desktop Regular → Premium → Inner Circle | mobile Premium → Regular → Inner Circle */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">

          {/* Regular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 md:order-1 bg-dark-bg border border-dark-border rounded-2xl p-6 lg:p-7 flex flex-col"
          >
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-off-white uppercase tracking-tight">Regular</h3>
            <PriceDisplay billing={billing} monthlyPrice={monthlyPrice} annualMonthlyPrice={annualMonthlyPrice} className="text-off-white" />
            <ul className="space-y-2.5 flex-1 mt-1">
              {regularFeatures.map((f, i) => <CheckItem key={i}>{f}</CheckItem>)}
            </ul>
            <button
              onClick={() => handleCheckout(billing)}
              disabled={checkoutLoading === billing}
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors mt-6 disabled:opacity-60"
            >
              {checkoutLoading === billing ? "Loading..." : <>{ctaLabel} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>

          {/* Premium — MOST POPULAR, cyan border */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 md:order-2 bg-dark-bg border-2 border-orange-red rounded-2xl p-6 lg:p-7 flex flex-col relative md:scale-[1.04] md:z-10"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-red text-dark-bg font-body text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </span>
            <h3 className="font-heading text-2xl lg:text-3xl font-bold text-orange-red uppercase tracking-tight mt-1">Premium</h3>
            <PriceDisplay billing={billing} monthlyPrice={monthlyPrice} annualMonthlyPrice={annualMonthlyPrice} className="text-off-white" />
            <p className="font-body text-xs text-white-muted mb-1 italic">Everything in Regular, plus:</p>
            <ul className="space-y-2.5 flex-1 mt-1">
              {regularFeatures.map((f, i) => <CheckItem key={`r-${i}`}>{f}</CheckItem>)}
              {premiumFeatures.map((f, i) => <CheckItem key={`p-${i}`}><span className="font-medium text-off-white">{f}</span></CheckItem>)}
            </ul>
            <button
              onClick={() => handleCheckout(billing)}
              disabled={checkoutLoading === billing}
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors mt-6 disabled:opacity-60"
            >
              {checkoutLoading === billing ? "Loading..." : <>{ctaLabel} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>

          {/* Inner Circle — gold accent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-3 md:order-3 bg-dark-bg border-2 rounded-2xl p-6 lg:p-7 flex flex-col relative"
            style={{ borderColor: GOLD }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 font-body text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap"
              style={{ backgroundColor: GOLD, color: "#0F0F0F" }}
            >
              Inner Circle — Applications Reviewed
            </span>
            <h3 className="font-heading text-2xl lg:text-3xl font-bold uppercase tracking-tight mt-1" style={{ color: GOLD }}>Inner Circle</h3>
            <div className="my-3">
              <span className="font-heading text-2xl lg:text-3xl font-bold text-off-white">Custom</span>
              <p className="font-body text-xs text-white-muted">Private consultation required</p>
            </div>
            <p className="font-body text-xs text-white-muted mb-1 italic">Everything in Premium, plus:</p>
            <ul className="space-y-2.5 flex-1 mt-1">
              {premiumFeatures.map((f, i) => <CheckItem key={`pp-${i}`} color="" style={{ color: GOLD }}>{f}</CheckItem>)}
              {innerCircleFeatures.map((f, i) => <CheckItem key={`ic-${i}`} color="" style={{ color: GOLD }}><span className="font-medium text-off-white">{f}</span></CheckItem>)}
            </ul>
            <a
              href="/inner-circle"
              className="flex items-center justify-center gap-2 w-full font-body text-sm font-bold py-3.5 rounded-full transition-colors mt-6"
              style={{ backgroundColor: GOLD, color: "#0F0F0F" }}
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