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
    track(plan === "annual" ? "gift_annual_cta_clicked" : "gift_monthly_cta_clicked", { plan });
    track("gift_checkout_started", { plan });
    trackMetaAddToCart({ value: plan === "annual" ? 240 : 35, currency: "USD", planType: plan, planLabel: plan === "annual" ? "Annual Membership" : "Monthly Membership" });
    const email = localStorage.getItem("gift_email") || "";
    const res = await base44.functions.invoke("createCheckout", { plan, ga_client_id: getGaClientId(), email: email || undefined });
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
          track("gift_membership_section_viewed");
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
  const pt = c.primaryTestimonial;

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
          className="text-center mb-8"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">
            {c.heading}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto">{c.supporting}</p>
        </motion.div>

        {/* Primary testimonial before pricing */}
        {pt && pt.quote && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto mb-10 text-center"
          >
            <p className="font-heading text-lg lg:text-xl text-off-white leading-relaxed italic mb-3">"{pt.quote}"</p>
            <div className="flex items-center justify-center gap-3">
              {pt.img ? (
                <img src={pt.img} alt={pt.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-orange-red/15 flex items-center justify-center text-orange-red font-heading font-bold text-base">
                  {(pt.name || "?").charAt(0)}
                </span>
              )}
              <span className="font-body text-sm font-semibold text-off-white">{pt.name}</span>
              {pt.context && <span className="font-body text-sm text-white-dim">— {pt.context}</span>}
            </div>
          </motion.div>
        )}

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
              {annual.badge || "MOST POPULAR"}
            </span>
            <p className="font-body text-sm font-bold text-dark-bg uppercase tracking-wide mb-3">{annual.title}</p>
            {annual.description && <p className="font-body text-xs text-dark-bg/80 leading-relaxed mb-4">{annual.description}</p>}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-dark-bg">{annual.price}</span>
              <span className="font-body text-sm text-dark-bg/70">{annual.period}</span>
            </div>
            <p className="font-body text-xs text-dark-bg font-semibold mb-5">{annual.billingNote}</p>
            <ul className="space-y-2.5 flex-1">
              {annual.benefits?.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-dark-bg/90 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("annual")}
              disabled={loading === "annual"}
              className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface-2 transition-colors disabled:opacity-60 mt-6"
            >
              {loading === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{annual.cta} <ArrowRight className="w-4 h-4" /></>}
            </button>
            {annual.microcopy && <p className="mt-3 text-center font-body text-[11px] text-dark-bg/70">{annual.microcopy}</p>}
          </motion.div>

          {/* Monthly — secondary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark-surface border border-dark-border rounded-2xl p-7 lg:p-8 flex flex-col"
          >
            <p className="font-body text-sm font-bold text-off-white uppercase tracking-wide mb-3">{monthly.title}</p>
            {monthly.description && <p className="font-body text-xs text-white-muted leading-relaxed mb-4">{monthly.description}</p>}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl font-bold text-off-white">{monthly.price}</span>
              <span className="font-body text-sm text-white-muted">{monthly.period}</span>
            </div>
            <p className="font-body text-xs text-white-muted mb-5">{monthly.billingNote}</p>
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
            {monthly.microcopy && <p className="mt-3 text-center font-body text-[11px] text-white-dim">{monthly.microcopy}</p>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}