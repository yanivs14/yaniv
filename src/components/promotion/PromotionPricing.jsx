import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

let _checkoutInProgress = false;
async function startCheckout(plan) {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "begin_checkout", currency: "USD", plan_type: plan });
    const res = await base44.functions.invoke("createCheckout", { plan });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

const DEFAULT_FEATURES = [
  "Personalized adaptive daily practice",
  "Full Movement training library (240+ sessions)",
  "Strength, mobility, control & longevity tracks",
  "Community access + challenges",
];

export default function PromotionPricing({ content }) {
  const [loading, setLoading] = useState(false);

  if (!content) return null;

  const features = content.pricingFeatures?.length ? content.pricingFeatures : DEFAULT_FEATURES;

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout("promo");
    setLoading(false);
  };

  return (
    <section className="py-12 lg:py-24 px-6" id="pricing">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {content.pricingEyebrow && (
            <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-3">{content.pricingEyebrow}</p>
          )}
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-off-white uppercase tracking-tight">
            {content.pricingTitle || "Membership"}
          </h2>
          {content.pricingSubtitle && (
            <p className="mt-3 font-body text-sm text-white-muted">{content.pricingSubtitle}</p>
          )}
        </motion.div>

        {/* Single pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative rounded-2xl p-8 flex flex-col"
          style={{
            background: "linear-gradient(145deg, #0d1a1a 0%, #111 100%)",
            border: "1px solid #1e3333",
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-orange-red to-transparent" />

          {/* Badge */}
          {content.pricingBadge && (
            <span className="self-start mb-4 font-heading text-xs font-bold text-dark-bg bg-orange-red px-3 py-1 rounded-full uppercase tracking-wider">
              {content.pricingBadge}
            </span>
          )}

          {/* Plan name */}
          <p className="font-body text-sm text-white-muted mb-1">{content.pricingPlanName || "Monthly"}</p>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 my-3">
            <span className="font-heading text-6xl font-bold text-off-white">{content.pricingPrice || "$25"}</span>
            <span className="font-body text-sm text-white-muted">{content.pricingPeriod || "/ month"}</span>
          </div>

          {/* Price note */}
          {content.pricingPriceNote && (
            <p className="font-body text-xs text-white-dim mb-5">{content.pricingPriceNote}</p>
          )}

          {/* Features */}
          <ul className="space-y-3 flex-1 mb-6">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-off-white/80">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleClick}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : <>{content.pricingCta || "Begin Monthly"} <ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="mt-3 font-body text-xs text-white-muted text-center">{content.pricingFooter || "Cancel anytime"}</p>
        </motion.div>
      </div>
    </section>
  );
}