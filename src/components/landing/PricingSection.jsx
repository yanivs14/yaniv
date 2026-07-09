import React, { useRef, useState, useEffect } from "react";
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

// Renders a price string with cents (anything after a ".") in a smaller size.
function PriceSplit({ price, className = "", small = false }) {
  const str = String(price || "");
  const dotIdx = str.indexOf(".");
  if (dotIdx === -1) {
    return <span className={`font-heading ${small ? "text-xl" : "text-6xl"} font-bold ${className}`}>{str}</span>;
  }
  const main = str.slice(0, dotIdx);
  const cents = str.slice(dotIdx); // includes the "."
  return (
    <span className={`font-heading ${small ? "text-xl" : "text-6xl"} font-bold ${className} flex items-baseline`}>
      {main}
      <span className={`${small ? "text-sm" : "text-2xl"} font-bold`}>{cents}</span>
    </span>);

}

const DEFAULT_MONTHLY_FEATURES = [
"Personalized adaptive daily practice",
"Full Movement training library (240+ sessions)",
"Strength, mobility, control & longevity tracks",
"Community access + challenges"];


const DEFAULT_ANNUAL_FEATURES = [
"Everything in Monthly, plus:",
"Weekly live coaching & feedback",
"Exclusive member-only trainings",
"Advanced content drops",
"Priority access to new releases",
"Annual member perks & content"];


function MonthlyCard({ c, mobile = false }) {
  const [loading, setLoading] = useState(false);
  const features = c.monthlyFeatures?.length ? c.monthlyFeatures : DEFAULT_MONTHLY_FEATURES;
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout("monthly");
    setLoading(false);
  };
  return (
    <div className={`${mobile ? "flex-shrink-0 w-[78vw] snap-start" : ""} bg-dark-bg border border-dark-border rounded-2xl ${mobile ? "p-5" : "p-8"} flex flex-col`}>
      <p className="font-body text-sm text-white-muted mb-1">Monthly</p>
      <div className="flex items-baseline gap-1 my-3">
        <PriceSplit price={c.monthlyPrice} className="text-off-white" />
        <span className="font-body text-sm text-white-muted">/ month</span>
      </div>
      {c.monthlySubtitle &&
      <p className="font-body text-sm text-white-muted mb-4 leading-relaxed">{c.monthlySubtitle}</p>
      }
      <ul className="space-y-2 flex-1">
        {features.map((f, i) =>
        <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
            <span className="font-body text-sm text-off-white/80">{f}</span>
          </li>
        )}
      </ul>
      <div className="mt-5">
        <button onClick={handleClick} disabled={loading}
        data-cta-id="pricing_monthly_cta"
        className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60">
          {loading ? "Loading..." : <>{c.ctaMonthly} <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="mt-2 font-body text-xs text-white-muted text-center">Cancel anytime</p>
      </div>
    </div>);

}

function AnnualCard({ c, mobile = false }) {
  const [loading, setLoading] = useState(false);
  const features = c.annualFeatures?.length ? c.annualFeatures : DEFAULT_ANNUAL_FEATURES;
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout("annual");
    setLoading(false);
  };
  return (
    <div className={`${mobile ? "flex-shrink-0 w-[78vw] snap-start" : ""} bg-orange-red border border-orange-red rounded-2xl ${mobile ? "p-5" : "p-8"} relative flex flex-col`}>
      <span className="absolute top-3 right-3 font-heading text-sm font-bold text-dark-bg bg-dark-bg/15 px-3 py-1 rounded-full uppercase">{c.annualInsteadOf}</span>
      <p className="font-body text-sm text-dark-bg/70 mb-1">Annual</p>
      <div className="flex items-baseline gap-1.5 my-3">
        <PriceSplit price={c.annualMonthlyPrice} className="text-dark-bg" />
        <span className="font-body text-sm text-dark-bg/60">/ month</span>
      </div>
      <p className="font-body text-sm text-dark-bg mb-1">
        <PriceSplit price={c.annualPrice} className="text-dark-bg" small /> / year billed annually
      </p>
      <p className="font-body text-xs font-bold text-dark-bg mb-1 bg-dark-bg/20 w-fit px-3 py-1 rounded-full">{c.annualSavings}</p>
      {c.annualSubtitle &&
      <p className="font-body text-sm text-dark-bg/80 mb-4 mt-2 leading-relaxed">{c.annualSubtitle}</p>
      }
      <ul className="space-y-2 flex-1">
        {features.map((f, i) =>
        <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
            <span className={`font-body text-sm text-dark-bg/90 ${i === 0 || i === 1 ? "font-bold" : ""}`}>{f}</span>
          </li>
        )}
      </ul>
      <div className="mt-4">
        <button onClick={handleClick} disabled={loading}
        data-cta-id="pricing_annual_cta"
        className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface transition-colors disabled:opacity-60">
          {loading ? "Loading..." : <>{c.ctaAnnual} <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="mt-2 font-body text-xs text-dark-bg/60 text-center">Cancel anytime</p>
      </div>
    </div>);

}

const MOBILE_TABS = ["annual", "monthly", "innerCircle"];

export default function PricingSection() {
  const { content } = useSiteContent();
  const scrollRef = useRef();
  const [activeTab, setActiveTab] = useState("annual");
  const pricingRef = useSectionTracking("pricing");

  useEffect(() => {
    if (content?.pricing) {
      trackPricingViewed(["annual", "monthly", "inner_circle"], "pricing_section");
    }
  }, [content]);

  // Detect scroll position to sync toggle (3 cards)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.offsetWidth * 0.82;
      const idx = Math.round(el.scrollLeft / (cardWidth + 16));
      setActiveTab(MOBILE_TABS[idx] || "annual");
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (plan) => {
    setActiveTab(plan);
    const idx = MOBILE_TABS.indexOf(plan);
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.offsetWidth * 0.82;
    el.scrollTo({ left: idx * (cardWidth + 16), behavior: "smooth" });
  };

  if (!content) return null;
  const c = content.pricing;

  return (
    <section ref={pricingRef} className="py-12 lg:py-24 bg-dark-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14">
          
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.headline1}<br />
            {c.headline2} <span className="text-orange-red">{c.headlineAccent}</span>
          </h2>
          <p className="mt-4 font-body text-base text-white-muted">{c.subtitle}</p>
        </motion.div>

        {/* Desktop: 3 columns - Annual, Monthly, Inner Circle */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          <AnnualCard c={c} />
          <MonthlyCard c={c} />
          <InnerCirclePricingCard c={c} />
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          {/* Toggle */}
          <div className="flex justify-center mb-5">
            <div className="flex bg-dark-bg border border-dark-border rounded-full p-1 gap-1">
              <button
                onClick={() => scrollTo("annual")}
                className={`px-4 py-2 rounded-full font-body text-sm font-semibold transition-colors ${activeTab === "annual" ? "bg-orange-red text-dark-bg" : "text-white-muted"}`}>
                Annual
              </button>
              <button
                onClick={() => scrollTo("monthly")}
                className={`px-4 py-2 rounded-full font-body text-sm font-semibold transition-colors ${activeTab === "monthly" ? "bg-orange-red text-dark-bg" : "text-white-muted"}`}>
                Monthly
              </button>
              <button
                onClick={() => scrollTo("innerCircle")}
                className={`px-4 py-2 rounded-full font-body text-sm font-semibold transition-colors ${activeTab === "innerCircle" ? "bg-orange-red text-dark-bg" : "text-white-muted"}`}>
                Inner Circle
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <AnnualCard c={c} mobile />
            <MonthlyCard c={c} mobile />
            <InnerCirclePricingCard c={c} mobile />
          </div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">No equipment required  · Cancel any time</p>
      </div>
    </section>);

}