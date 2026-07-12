import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";
import { trackPricingViewed, track, getGaClientId } from "@/lib/analytics";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import InnerCirclePricingCard from "./InnerCirclePricingCard";

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

export default function PricingSection() {
  const { content } = useSiteContent();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [mobilePlan, setMobilePlan] = useState("monthly");
  const mobileSliderRef = useRef(null);
  const pricingRef = useSectionTracking("pricing");

  const mobilePlanKeys = ["monthly", "annual", "inner"];

  const handleMobileScroll = () => {
    const container = mobileSliderRef.current;
    if (!container || container.children.length === 0) return;
    const cardWidth = container.children[0].offsetWidth + 20;
    const idx = Math.max(0, Math.min(2, Math.round(container.scrollLeft / cardWidth)));
    if (mobilePlanKeys[idx] !== mobilePlan) {
      setMobilePlan(mobilePlanKeys[idx]);
    }
  };

  const scrollToMobilePlan = (plan) => {
    setMobilePlan(plan);
    const container = mobileSliderRef.current;
    if (!container || container.children.length === 0) return;
    const idx = mobilePlanKeys.indexOf(plan);
    if (idx === -1) return;
    const cardWidth = container.children[0].offsetWidth + 20;
    container.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
  };

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
    "Personalized adaptive daily practice",
    "Full Movement training library (240+ sessions)",
    "Strength, mobility, control & longevity tracks",
    "Community access + challenges",
  ];

  const annualFeatures = c.annualFeatures?.length ? c.annualFeatures : [
    "Everything in Monthly, plus:",
    "Weekly live coaching & feedback",
    "Exclusive member-only trainings",
    "Advanced content drops",
    "Priority access to new releases",
    "Annual member perks & content",
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
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.sectionTitle || "Memberships"}
          </h2>
        </motion.div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Monthly */}
          <div className="bg-dark-bg border border-dark-border rounded-2xl p-8 flex flex-col">
            <p className="font-body text-sm text-white-muted mb-1">Monthly</p>
            <div className="flex items-baseline gap-1 my-2">
              <PriceSplit price={c.monthlyPrice} className="text-off-white" />
              <span className="font-body text-sm text-white-muted">/ month</span>
            </div>
            {c.monthlySubtitle && <p className="font-body text-xs text-white-muted mb-4 leading-relaxed">{c.monthlySubtitle}</p>}
            <ul className="space-y-2.5 flex-1">
              {monthlyFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80">{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout("monthly")} disabled={checkoutLoading === "monthly"}
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-6">
              {checkoutLoading === "monthly" ? "Loading..." : <>{c.ctaMonthly} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="mt-2 font-body text-xs text-transparent select-none" aria-hidden="true">Starts with a private consultation.</p>
          </div>

          {/* Annual */}
          <div className="bg-orange-red border border-orange-red rounded-2xl p-8 relative flex flex-col">
            <span className="absolute top-3 right-3 font-heading text-xs font-bold text-dark-bg bg-dark-bg/15 px-3 py-1 rounded-full uppercase">{c.annualInsteadOf}</span>
            <p className="font-body text-sm text-dark-bg/70 mb-1">Annual</p>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <PriceSplit price={c.annualMonthlyPrice} className="text-dark-bg" />
                <span className="font-body text-sm text-dark-bg/60">/ mo</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <PriceSplit price={c.annualPrice} className="text-dark-bg" small />
                <span className="font-body text-sm text-dark-bg/60">/ yr billed annually</span>
              </div>
            </div>
            <p className="font-body text-xs font-bold text-dark-bg mb-1 bg-dark-bg/20 w-fit px-3 py-1 rounded-full">{c.annualSavings}</p>
            {c.annualSubtitle && <p className="font-body text-xs text-dark-bg/80 mb-4 mt-2 leading-relaxed">{c.annualSubtitle}</p>}
            <ul className="space-y-2.5 flex-1">
              {annualFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                  <span className={`font-body text-sm text-dark-bg/90 ${i === 0 || i === 1 ? "font-bold" : ""}`}>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout("annual")} disabled={checkoutLoading === "annual"}
              className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface transition-colors disabled:opacity-60 mt-6">
              {checkoutLoading === "annual" ? "Loading..." : <>{c.ctaAnnual} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="mt-2 font-body text-xs text-transparent select-none" aria-hidden="true">Starts with a private consultation.</p>
          </div>

          {/* Inner Circle */}
          <InnerCirclePricingCard c={c} />
        </div>

        {/* Mobile: synced toggle + slider */}
        <div className="md:hidden">
          <div className="flex gap-1 p-1 bg-dark-bg border border-dark-border rounded-full mb-6 max-w-sm mx-auto">
            {[
              { key: "monthly", label: "Monthly" },
              { key: "annual", label: "Annual" },
              { key: "inner", label: "Inner Circle" },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => scrollToMobilePlan(opt.key)}
                className={`flex-1 py-2 px-2 rounded-full font-body text-[11px] font-semibold uppercase transition-colors whitespace-nowrap ${
                  mobilePlan === opt.key ? "bg-orange-red text-dark-bg" : "text-white-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            ref={mobileSliderRef}
            onScroll={handleMobileScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar"
          >
            {/* Monthly mobile */}
            <div className="flex-shrink-0 w-[78vw] snap-start bg-dark-bg border border-dark-border rounded-2xl p-5 flex flex-col">
              <p className="font-body text-sm text-white-muted mb-1">Monthly</p>
              <div className="flex items-baseline gap-1 my-2">
                <PriceSplit price={c.monthlyPrice} className="text-off-white" />
                <span className="font-body text-sm text-white-muted">/ month</span>
              </div>
              {c.monthlySubtitle && <p className="font-body text-xs text-white-muted mb-4 leading-relaxed">{c.monthlySubtitle}</p>}
              <ul className="space-y-2 flex-1">
                {monthlyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-off-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCheckout("monthly")} disabled={checkoutLoading === "monthly"}
                className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-5">
                {checkoutLoading === "monthly" ? "Loading..." : <>{c.ctaMonthly} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>

            {/* Annual mobile */}
            <div className="flex-shrink-0 w-[78vw] snap-start bg-orange-red border border-orange-red rounded-2xl p-5 relative flex flex-col">
              <span className="absolute top-3 right-3 font-heading text-xs font-bold text-dark-bg bg-dark-bg/15 px-3 py-1 rounded-full uppercase">{c.annualInsteadOf}</span>
              <p className="font-body text-sm text-dark-bg/70 mb-1">Annual</p>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5">
                  <PriceSplit price={c.annualMonthlyPrice} className="text-dark-bg" />
                  <span className="font-body text-sm text-dark-bg/60">/ mo</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <PriceSplit price={c.annualPrice} className="text-dark-bg" small />
                  <span className="font-body text-sm text-dark-bg/60">/ yr billed annually</span>
                </div>
              </div>
              <p className="font-body text-xs font-bold text-dark-bg mb-1 bg-dark-bg/20 w-fit px-3 py-1 rounded-full">{c.annualSavings}</p>
              {c.annualSubtitle && <p className="font-body text-xs text-dark-bg/80 mb-4 mt-2 leading-relaxed">{c.annualSubtitle}</p>}
              <ul className="space-y-2 flex-1">
                {annualFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                    <span className={`font-body text-sm text-dark-bg/90 ${i === 0 || i === 1 ? "font-bold" : ""}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCheckout("annual")} disabled={checkoutLoading === "annual"}
                className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface transition-colors disabled:opacity-60 mt-5">
                {checkoutLoading === "annual" ? "Loading..." : <>{c.ctaAnnual} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>

            {/* Inner Circle mobile */}
            <InnerCirclePricingCard c={c} mobile />
          </div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">No equipment required · Cancel any time</p>
      </div>
    </section>
  );
}