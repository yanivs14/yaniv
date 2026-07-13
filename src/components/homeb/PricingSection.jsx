import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";
import { trackPricingViewed, track, getGaClientId } from "@/lib/analytics";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import BookCallModal from "@/components/landing/BookCallModal";
import InnerCircleQualification from "@/components/homeb/InnerCircleQualification";

const MOBILE_PLAN_KEYS = ["monthly", "annual", "inner"];

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
  const [bookCallOpen, setBookCallOpen] = useState(false);
  const [qualOpen, setQualOpen] = useState(false);
  const [mobilePlan, setMobilePlan] = useState("annual");
  const mobileSliderRef = useRef(null);
  const pricingRef = useSectionTracking("pricing");

  useEffect(() => {
    const container = mobileSliderRef.current;
    if (!container || container.children.length === 0) return;
    const idx = MOBILE_PLAN_KEYS.indexOf("annual");
    if (idx === -1) return;
    const cardWidth = container.children[0].offsetWidth + 20;
    container.scrollTo({ left: idx * cardWidth });
  }, []);

  const handleMobileScroll = () => {
    const container = mobileSliderRef.current;
    if (!container || container.children.length === 0) return;
    const cardWidth = container.children[0].offsetWidth + 20;
    const idx = Math.max(0, Math.min(2, Math.round(container.scrollLeft / cardWidth)));
    if (MOBILE_PLAN_KEYS[idx] !== mobilePlan) {
      setMobilePlan(MOBILE_PLAN_KEYS[idx]);
    }
  };

  const scrollToMobilePlan = (plan) => {
    setMobilePlan(plan);
    const container = mobileSliderRef.current;
    if (!container || container.children.length === 0) return;
    const idx = MOBILE_PLAN_KEYS.indexOf(plan);
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

  const handleApplyInner = () => {
    setQualOpen(true);
  };

  const handleQualify = () => {
    setQualOpen(false);
    setBookCallOpen(true);
  };

  const monthlyFeatures = c.monthlyFeatures?.length ? c.monthlyFeatures : [
  "Full training library with 240+ guided sessions",
  "Programs for mobility, strength, control, and longevity",
  "New sessions, challenges, and community access"];


  const annualFeatures = c.annualFeatures?.length ? c.annualFeatures : [
  "Everything included in Monthly",
  "Exclusive ongoing content for annual members",
  "Weekly live call with The Movement team"];


  const innerCircleFeatures = c.innerCircleFeatures?.length ? c.innerCircleFeatures : [
  "Everything in Annual, plus:",
  "Personal assessment and 1:1 strategy with Roye",
  "Weekly live coaching and direct feedback",
  "Progress reviews and plan adjustments",
  "Private community of committed members"];


  const sectionTitle = c.sectionTitle || "Choose Your Membership";
  const titleParts = sectionTitle.split(" ");
  const titleLast = titleParts.pop();

  return (
    <section ref={pricingRef} className="py-12 lg:py-24 bg-dark-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 max-w-2xl mx-auto">
          
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {titleParts.join(" ")} <span className="text-orange-red">{titleLast}</span>
          </h2>
          {c.sectionSubtitle &&
          <p className="mt-5 font-body text-base lg:text-lg text-white-muted leading-relaxed">
              {c.sectionSubtitle}
            </p>
          }
          {c.sectionSubtext &&
          <p className="mt-3 font-body text-sm text-white-dim leading-relaxed">
              {c.sectionSubtext}
            </p>
          }
        </motion.div>

        {/* Desktop: 3 columns */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-dark-bg border border-dark-border rounded-2xl p-8 pb-10 flex flex-col">
            
            <p className="font-body text-sm font-bold text-off-white uppercase tracking-widest mb-4">Monthly Membership</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-off-white">{c.monthlyPrice || "$35"}</span>
              <span className="font-body text-sm text-white-muted">/ month</span>
            </div>
            {c.monthlyDescription &&
            <p className="font-body text-sm text-white-muted mb-6 mt-2 leading-relaxed">{c.monthlyDescription}</p>
            }
            {!c.monthlyDescription && <div className="mb-6" />}
            <p className="font-body text-[11px] font-bold uppercase tracking-widest mb-3 text-[hsl(var(--primary-foreground))]">WHAT'S INCLUDED</p>
            <ul className="space-y-3 flex-1">
              {monthlyFeatures.map((f, i) =>
              <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted">{f}</span>
                </li>
              )}
            </ul>
            <button
              onClick={() => handleCheckout("monthly")}
              disabled={checkoutLoading === "monthly"}
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-6">
              
              {checkoutLoading === "monthly" ? "Loading..." : <>{c.ctaMonthly || "Begin Monthly"} <ArrowRight className="w-4 h-4" /></>}
            </button>
            {c.monthlyFootnote &&
            <p className="font-body text-xs text-white-dim text-center mt-3">{c.monthlyFootnote}</p>
            }
          </motion.div>

          {/* Annual - Most Popular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-orange-red rounded-2xl p-8 pb-10 relative flex flex-col mt-6 md:mt-0">
            
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-dark-bg text-orange-red text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">Most Popular</span>
            <p className="font-body text-sm font-bold text-dark-bg uppercase tracking-widest mb-4">Annual Membership</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-dark-bg">{c.annualMonthlyPrice || "$20"}</span>
              <span className="font-body text-sm text-dark-bg/70">/ month</span>
            </div>
            {c.annualSavings &&
            <p className="font-body text-xs text-dark-bg font-semibold mb-1">Billed annually at{c.annualPrice || "$240"} · {c.annualSavings}</p>
            }
            {c.annualDescription &&
            <p className="font-body text-sm text-dark-bg/80 mb-6 mt-2 leading-relaxed">{c.annualDescription}</p>
            }
            <p className="font-body text-[11px] font-bold text-dark-bg uppercase tracking-widest mb-3">What's Included</p>
            <ul className="space-y-3 flex-1">
              {annualFeatures.map((f, i) =>
              <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-dark-bg/80">{f}</span>
                </li>
              )}
            </ul>
            <button
              onClick={() => handleCheckout("annual")}
              disabled={checkoutLoading === "annual"}
              className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface-2 transition-colors disabled:opacity-60 mt-6">
              
              {checkoutLoading === "annual" ? "Loading..." : <>{c.ctaAnnual || "Begin Annual"} <ArrowRight className="w-4 h-4" /></>}
            </button>
            {c.annualFootnote &&
            <p className="font-body text-xs text-dark-bg/60 text-center mt-3">{c.annualFootnote}</p>
            }
          </motion.div>

          {/* Inner Circle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-dark-bg border border-gold rounded-2xl p-8 pb-10 relative flex flex-col mt-6 md:mt-0">
            
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-dark-bg text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">{c.innerCircleBadge || "By Application Only"}</span>
            <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-1">{c.innerCircleTitle || "Inner Circle"}</h3>
            <p className="font-body text-sm font-bold text-gold uppercase tracking-widest mb-2">{c.innerCircleSubtitle || "Private Coaching"}</p>
            {c.innerCircleTagline &&
            <p className="font-body text-xs text-gold font-semibold mb-4">{c.innerCircleTagline}</p>
            }
            {c.innerCircleDescription &&
            <p className="font-body text-sm text-white-muted mb-6 leading-relaxed">{c.innerCircleDescription}</p>
            }
            <p className="font-body text-[11px] font-bold text-gold uppercase tracking-widest mb-3">What's Included</p>
            <ul className="space-y-3 flex-1">
              {innerCircleFeatures.map((f, i) =>
              <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted">{f}</span>
                </li>
              )}
            </ul>
            <button
              onClick={handleApplyInner}
              className="flex items-center justify-center gap-2 w-full bg-gold text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors mt-6">
              
              {c.innerCircleCta || "Apply for Inner Circle"} <ArrowRight className="w-4 h-4" />
            </button>
            {c.innerCircleFootnote &&
            <p className="font-body text-xs text-white-dim text-center mt-3">{c.innerCircleFootnote}</p>
            }
          </motion.div>
        </div>

        {/* Mobile: synced toggle + slider */}
        <div className="lg:hidden">
          <div className="flex gap-1 p-1 bg-dark-bg border border-dark-border rounded-full mb-6 max-w-sm mx-auto">
            {[
            { key: "monthly", label: "Monthly" },
            { key: "annual", label: "Annual" },
            { key: "inner", label: "Inner Circle" }].
            map((opt) =>
            <button
              key={opt.key}
              onClick={() => scrollToMobilePlan(opt.key)}
              className={`flex-1 py-2 px-2 rounded-full font-body text-[11px] font-semibold uppercase transition-colors whitespace-nowrap ${
              mobilePlan === opt.key ? "bg-orange-red text-dark-bg" : "text-white-muted"}`
              }>
              
                {opt.label}
              </button>
            )}
          </div>

          <div
            ref={mobileSliderRef}
            onScroll={handleMobileScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pt-6 pb-4 no-scrollbar px-4 scroll-px-4">
            
            {/* Monthly mobile */}
            <div className="flex-shrink-0 w-[75vw] snap-start bg-dark-bg border border-dark-border rounded-2xl p-5 pb-6 flex flex-col">
              <p className="font-body text-sm font-bold text-off-white uppercase tracking-widest mb-3">Monthly Membership</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-heading text-4xl font-bold text-off-white">{c.monthlyPrice || "$35"}</span>
                <span className="font-body text-sm text-white-muted">/ month</span>
              </div>
              {c.monthlyDescription &&
              <p className="font-body text-xs text-white-muted mb-4 mt-1 leading-relaxed">{c.monthlyDescription}</p>
              }
              <p className="font-body text-[11px] font-bold text-orange-red uppercase tracking-widest mb-2">What's Included</p>
              <ul className="space-y-2.5 flex-1">
                {monthlyFeatures.map((f, i) =>
                <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-white-muted">{f}</span>
                  </li>
                )}
              </ul>
              <button
                onClick={() => handleCheckout("monthly")}
                disabled={checkoutLoading === "monthly"}
                className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-5">
                
                {checkoutLoading === "monthly" ? "Loading..." : <>{c.ctaMonthly || "Begin Monthly"} <ArrowRight className="w-4 h-4" /></>}
              </button>
              {c.monthlyFootnote &&
              <p className="font-body text-xs text-white-dim text-center mt-2">{c.monthlyFootnote}</p>
              }
            </div>

            {/* Annual mobile */}
            <div className="flex-shrink-0 w-[75vw] snap-start bg-orange-red rounded-2xl p-5 pb-6 relative flex flex-col">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-dark-bg text-orange-red text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">Most Popular</span>
              <p className="font-body text-sm font-bold text-dark-bg uppercase tracking-widest mb-3 mt-2">Annual Membership</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-heading text-4xl font-bold text-dark-bg">{c.annualMonthlyPrice || "$20"}</span>
                <span className="font-body text-sm text-dark-bg/70">/ month</span>
              </div>
              {c.annualSavings &&
              <p className="font-body text-xs text-dark-bg font-semibold mb-1">Billed annually at {c.annualPrice || "$240"} · {c.annualSavings}</p>
              }
              {c.annualDescription &&
              <p className="font-body text-xs text-dark-bg/80 mb-3 mt-1 leading-relaxed">{c.annualDescription}</p>
              }
              <p className="font-body text-[11px] font-bold text-dark-bg uppercase tracking-widest mb-2">What's Included</p>
              <ul className="space-y-2.5 flex-1">
                {annualFeatures.map((f, i) =>
                <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-dark-bg/80">{f}</span>
                  </li>
                )}
              </ul>
              <button
                onClick={() => handleCheckout("annual")}
                disabled={checkoutLoading === "annual"}
                className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface-2 transition-colors disabled:opacity-60 mt-5">
                
                {checkoutLoading === "annual" ? "Loading..." : <>{c.ctaAnnual || "Begin Annual"} <ArrowRight className="w-4 h-4" /></>}
              </button>
              {c.annualFootnote &&
              <p className="font-body text-xs text-dark-bg/60 text-center mt-2">{c.annualFootnote}</p>
              }
            </div>

            {/* Inner Circle mobile */}
            <div className="flex-shrink-0 w-[75vw] snap-start bg-dark-bg border border-gold rounded-2xl p-5 pb-6 relative flex flex-col">
              <span className="absolute -top-3 left-3 right-3 text-center bg-gold text-dark-bg text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">{c.innerCircleBadge || "By Application Only"}</span>
              <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-1 mt-2">{c.innerCircleTitle || "Inner Circle"}</h3>
              <p className="font-body text-xs font-bold text-gold uppercase tracking-widest mb-2">{c.innerCircleSubtitle || "Private Coaching"}</p>
              {c.innerCircleTagline &&
              <p className="font-body text-[11px] text-gold font-semibold mb-3">{c.innerCircleTagline}</p>
              }
              {c.innerCircleDescription &&
              <p className="font-body text-xs text-white-muted mb-3 leading-relaxed">{c.innerCircleDescription}</p>
              }
              <p className="font-body text-[11px] font-bold text-gold uppercase tracking-widest mb-2">What's Included</p>
              <ul className="space-y-2.5 flex-1">
                {innerCircleFeatures.map((f, i) =>
                <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-white-muted">{f}</span>
                  </li>
                )}
              </ul>
              <button
                onClick={handleApplyInner}
                className="flex items-center justify-center gap-2 w-full bg-gold text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors mt-5">
                
                {c.innerCircleCta || "Apply for Inner Circle"} <ArrowRight className="w-4 h-4" />
              </button>
              {c.innerCircleFootnote &&
              <p className="font-body text-xs text-white-dim text-center mt-2">{c.innerCircleFootnote}</p>
              }
            </div>
          </div>
        </div>
      </div>
      <BookCallModal open={bookCallOpen} onClose={() => setBookCallOpen(false)} />
      <InnerCircleQualification open={qualOpen} onClose={() => setQualOpen(false)} onQualify={handleQualify} />
    </section>);

}