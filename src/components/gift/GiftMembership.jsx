import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId, trackMetaAddToCart } from "@/lib/analytics";

let _checkoutInProgress = false;

async function startCheckout(plan) {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track(plan === "annual" ? "annual_membership_clicked" : "monthly_membership_clicked", { plan });
    track("checkout_started", { plan });
    trackMetaAddToCart({ value: plan === "annual" ? 240 : 35, currency: "USD", planType: plan, planLabel: plan === "annual" ? "Annual Membership" : "Monthly Membership" });
    const res = await base44.functions.invoke("createCheckout", { plan, ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function GiftMembership({ c }) {
  const [loading, setLoading] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          track("membership_options_viewed");
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!c) return null;
  const annual = c.annual || {};
  const monthly = c.monthly || {};

  const handleCheckout = async (plan) => {
    setLoading(plan);
    await startCheckout(plan);
    setLoading(null);
  };

  return (
    <section id="membership" ref={ref} className="bg-dark-bg py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">
            {c.heading}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto">{c.supporting}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto items-stretch">
          {/* Annual — primary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-orange-red rounded-2xl p-7 lg:p-8 relative flex flex-col"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-dark-bg text-orange-red text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
              {annual.badge || "RECOMMENDED"}
            </span>
            <p className="font-body text-sm font-bold text-dark-bg uppercase tracking-wide mb-4">{annual.title}</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-dark-bg">{annual.price}</span>
              <span className="font-body text-sm text-dark-bg/70">{annual.period}</span>
            </div>
            <p className="font-body text-xs text-dark-bg font-semibold mb-5">{annual.billingNote}</p>
            <p className="font-body text-[11px] font-bold text-dark-bg uppercase tracking-widest mb-3">What's Included</p>
            <ul className="space-y-2.5 flex-1">
              {annual.benefits?.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-dark-bg/90 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            {c.handstandLine && (
              <div className="mt-4 bg-dark-bg/25 rounded-lg px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-dark-bg flex-shrink-0" />
                <p className="font-body text-xs font-bold text-dark-bg uppercase tracking-wide">{c.handstandLine}</p>
              </div>
            )}
            <button
              onClick={() => handleCheckout("annual")}
              disabled={loading === "annual"}
              className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface-2 transition-colors disabled:opacity-60 mt-6"
            >
              {loading === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{annual.cta} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>

          {/* Monthly — secondary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark-surface border border-dark-border rounded-2xl p-7 lg:p-8 flex flex-col"
          >
            <p className="font-body text-sm font-bold text-off-white uppercase tracking-wide mb-4">{monthly.title}</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-off-white">{monthly.price}</span>
              <span className="font-body text-sm text-white-muted">{monthly.period}</span>
            </div>
            <p className="font-body text-xs text-white-muted mb-5">{monthly.cancelNote}</p>
            <p className="font-body text-[11px] font-bold text-orange-red uppercase tracking-widest mb-3">What's Included</p>
            <ul className="space-y-2.5 flex-1">
              {monthly.benefits?.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("monthly")}
              disabled={loading === "monthly"}
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors disabled:opacity-60 mt-6"
            >
              {loading === "monthly" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{monthly.cta} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.div>
        </div>

        <p className="font-body text-xs text-white-dim text-center max-w-xl mx-auto mt-6 leading-relaxed">{c.noteLine}</p>
      </div>
    </section>
  );
}