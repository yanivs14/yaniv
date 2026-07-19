import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId, trackMetaAddToCart } from "@/lib/analytics";
import Handstand4LifeCard from "@/components/handstand/Handstand4LifeCard";

let _checkoutInProgress = false;

async function startCheckout() {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track("begin_checkout", {
      currency: "USD",
      plan_type: "handstand_course",
      page_state: "handstand_pricing",
    });
    trackMetaAddToCart({ value: 97, currency: "USD", planType: "handstand_course", planLabel: "Handstand Course" });
    const res = await base44.functions.invoke("createHandstandCheckout", {
      ga_client_id: getGaClientId(),
    });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function HandstandPricing({ c }) {
  const [loading, setLoading] = useState(false);
  const features = c?.features || [];

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout();
    setLoading(false);
  };

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-dark-surface">
      <div className="max-w-md mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-off-white uppercase tracking-tight mb-3">
            {c?.headline}
          </h2>
          <p className="font-body text-base text-white-muted">{c?.subtitle}</p>
          {c?.lockInTitle && (
            <div className="mt-6">
              <p className="font-heading text-lg font-bold text-orange-red uppercase tracking-tight">{c.lockInTitle}</p>
              {c?.lockInSubtitle && <p className="font-body text-sm text-white-muted mt-1">{c.lockInSubtitle}</p>}
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-dark-bg border-2 border-orange-red rounded-3xl p-8 relative overflow-hidden"
        >
          {c?.badge && (
            <div className="absolute top-0 right-0 bg-orange-red text-dark-bg px-4 py-1.5 rounded-bl-2xl">
              <span className="font-heading text-xs font-bold uppercase">{c.badge}</span>
            </div>
          )}
          <div className="text-center mb-6 mt-4">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-heading text-2xl font-bold text-white-muted">$</span>
              <span className="font-heading text-7xl font-bold text-off-white">{c?.price}</span>
            </div>
            <p className="font-body text-sm text-white-muted">{c?.priceNote}</p>
          </div>
          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-orange-red flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-off-white/90">{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleClick}
            disabled={loading}
            data-cta-id="handstand_pricing_cta"
            className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-base font-semibold py-4 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : <>{c?.ctaText} <ArrowRight className="w-5 h-5" /></>}
          </button>
          {c?.guarantee && (
            <div className="flex items-center justify-center gap-2 mt-5 text-white-dim">
              <Shield className="w-4 h-4" />
              <p className="font-body text-xs">{c.guarantee}</p>
            </div>
          )}
        </motion.div>
        <Handstand4LifeCard />
      </div>
    </section>
  );
}