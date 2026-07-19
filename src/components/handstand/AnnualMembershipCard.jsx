import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId, trackMetaAddToCart } from "@/lib/analytics";

const ANNUAL_FEATURES = [
  "Everything in Monthly",
  "Weekly live community calls & Q&As",
  "Exclusive ongoing content",
];

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
      plan_type: "annual",
      page_state: "handstand_pricing",
    });
    trackMetaAddToCart({ value: 250, currency: "USD", planType: "annual", planLabel: "Annual Membership" });
    const res = await base44.functions.invoke("createCheckout", {
      plan: "annual",
      ga_client_id: getGaClientId(),
    });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function AnnualMembershipCard() {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    await startCheckout();
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 w-full"
    >
      <div className="bg-orange-red rounded-2xl relative overflow-hidden">
        <span className="absolute -top-px left-8 bg-dark-bg text-orange-red text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-b-xl whitespace-nowrap">
          Best Offer
        </span>
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {/* Left: Price + CTA */}
          <div className="p-6 lg:p-8 lg:w-[42%] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-dark-bg/20">
            <div className="flex items-center gap-2 mb-4">
              <p className="font-body text-sm font-bold text-dark-bg uppercase tracking-wide whitespace-nowrap">
                Annual Membership
              </p>
              <span className="bg-dark-bg/30 text-dark-bg text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                Save $180
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-heading text-5xl lg:text-6xl font-bold text-dark-bg">$20</span>
              <span className="font-body text-base text-dark-bg/70">/ month</span>
            </div>
            <p className="font-body text-xs text-dark-bg font-semibold mb-5">
              Billed annually at $240 (save $180)
            </p>
            <button
              onClick={handleClick}
              disabled={loading}
              data-cta-id="annual_membership_cta"
              className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface-2 transition-colors disabled:opacity-60"
            >
              {loading ? "Loading..." : <>Begin Annual <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
          {/* Right: Features */}
          <div className="p-6 lg:p-8 lg:flex-1 flex flex-col justify-center">
            <p className="font-body text-[11px] font-bold text-dark-bg uppercase tracking-widest mb-3">
              What's Included
            </p>
            <ul className="space-y-2.5">
              {ANNUAL_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-dark-bg/90">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}