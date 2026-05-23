import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";

async function startCheckout(plan) {
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  const res = await base44.functions.invoke("createCheckout", { plan });
  if (res.data?.url) window.location.href = res.data.url;
}

const sharedFeatures = [
  "The full Kinetiqo OS — daily adaptive practice",
  "All 240+ guided sessions with Roye",
  "Mobility, control, strength, longevity tracks",
  "Streak system + identity check-ins",
  "Live monthly sessions with Roye",
];

const annualExtra = "Unlocked: Advanced flows + restoration protocols";

function MonthlyCard({ c, mobile = false }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout("monthly");
    setLoading(false);
  };
  return (
    <div className={`${mobile ? "flex-shrink-0 w-[78vw] snap-start" : ""} bg-dark-bg border border-dark-border rounded-2xl ${mobile ? "p-5" : "p-8"}`}>
      <p className="font-body text-sm text-white-muted mb-1">Kinetiqo Monthly</p>
      <div className="flex items-baseline gap-1 my-3">
        <span className="font-heading text-6xl font-bold text-off-white">{c.monthlyPrice}</span>
        <span className="font-body text-sm text-white-muted">/ month</span>
      </div>
      <ul className="space-y-2 mb-5">
        {sharedFeatures.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
            <span className="font-body text-sm text-off-white/80">{f}</span>
          </li>
        ))}
      </ul>
      <button onClick={handleClick} disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60">
        {loading ? "Loading..." : <>{c.ctaMonthly.replace(/^begin\s*/i, '')} <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="mt-2 font-body text-xs text-white-muted text-center">Cancel anytime</p>
    </div>
  );
}

function AnnualCard({ c, mobile = false }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout("annual");
    setLoading(false);
  };
  return (
    <div className={`${mobile ? "flex-shrink-0 w-[78vw] snap-start" : ""} bg-orange-red border border-orange-red rounded-2xl ${mobile ? "p-5" : "p-8"} relative`}>
      <div className="absolute top-3 right-3 bg-dark-bg/20 text-dark-bg font-body text-xs font-semibold px-3 py-1 rounded-full">
        Best value
      </div>
      <p className="font-body text-sm text-dark-bg/70 mb-1">Kinetiqo Annual</p>
      <div className="flex items-baseline gap-2 my-3">
        <span className="font-heading text-6xl font-bold text-dark-bg">{c.annualPrice}</span>
        <span className="font-body text-sm text-dark-bg/60">/ year</span>
        <span className="font-body text-sm text-dark-bg/40 line-through">{c.annualOldPrice}</span>
      </div>
      <p className="font-body text-xs font-bold text-dark-bg mb-3 bg-dark-bg/20 inline-block px-3 py-1 rounded-full">{c.annualSavings}</p>
      <ul className="space-y-2 mb-4">
        {sharedFeatures.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
            <span className="font-body text-sm text-dark-bg/90">{f}</span>
          </li>
        ))}
        <li className="flex items-start gap-2.5">
          <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
          <span className="font-body text-sm text-dark-bg font-semibold">{annualExtra}</span>
        </li>
      </ul>
      <button onClick={handleClick} disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface transition-colors disabled:opacity-60">
        {loading ? "Loading..." : <>{c.ctaAnnual.replace(/^begin\s*/i, '')} <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="mt-2 font-body text-xs text-dark-bg/60 text-center">Cancel anytime</p>
    </div>
  );
}

export default function PricingSection() {
  const { content } = useSiteContent();
  const c = content.pricing;
  const scrollRef = useRef();
  const [activeTab, setActiveTab] = useState("annual");

  const scrollTo = (plan) => {
    setActiveTab(plan);
    const idx = plan === "annual" ? 0 : 1;
    scrollRef.current?.scrollTo({ left: idx * (scrollRef.current.offsetWidth * 0.82), behavior: "smooth" });
  };

  return (
    <section className="py-12 lg:py-24 bg-dark-surface" id="pricing">
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

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <MonthlyCard c={c} />
          <AnnualCard c={c} />
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          {/* Toggle */}
          <div className="flex justify-center mb-5">
            <div className="flex bg-dark-bg border border-dark-border rounded-full p-1 gap-1">
              <button
                onClick={() => scrollTo("annual")}
                className={`px-5 py-2 rounded-full font-body text-sm font-semibold transition-colors ${activeTab === "annual" ? "bg-orange-red text-dark-bg" : "text-white-muted"}`}
              >
                Annual
              </button>
              <button
                onClick={() => scrollTo("monthly")}
                className={`px-5 py-2 rounded-full font-body text-sm font-semibold transition-colors ${activeTab === "monthly" ? "bg-orange-red text-dark-bg" : "text-white-muted"}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <AnnualCard c={c} mobile />
            <MonthlyCard c={c} mobile />
          </div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">No equipment · Cancel any time</p>
      </div>
    </section>
  );
}