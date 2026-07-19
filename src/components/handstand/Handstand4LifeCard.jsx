import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId, trackMetaAddToCart } from "@/lib/analytics";

const FEATURES = [
  "8-week structured progression",
  "40+ video lessons",
  "Daily practice plans",
  "Wall-free bail techniques",
  "Strength & mobility drills",
  "Lifetime access",
  "Mobile-friendly format",
  "Future updates included",
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
      plan_type: "handstand_4_life",
      page_state: "handstand_pricing",
    });
    trackMetaAddToCart({ value: 197, currency: "USD", planType: "handstand_4_life", planLabel: "Handstand 4 Life" });
    const res = await base44.functions.invoke("createHandstandCheckout", {
      plan: "handstand_4_life",
      ga_client_id: getGaClientId(),
    });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function Handstand4LifeCard() {
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
      className="mt-6 max-w-sm mx-auto"
    >
      <div className="bg-dark-bg border border-orange-red/40 rounded-2xl p-5 relative">
        <div className="text-center mb-4">
          <p className="font-body text-[10px] text-orange-red uppercase tracking-[0.2em] font-bold mb-1">
            Also Available
          </p>
          <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-1">
            Handstand 4 Life
          </h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-heading text-sm font-bold text-white-muted">$</span>
            <span className="font-heading text-3xl font-bold text-off-white">197</span>
          </div>
          <p className="font-body text-[11px] text-white-dim">One-time payment</p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mb-4">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-orange-red flex-shrink-0 mt-0.5" />
              <span className="font-body text-[11px] text-white-muted leading-tight">{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handleClick}
          disabled={loading}
          data-cta-id="handstand_4_life_cta"
          className="flex items-center justify-center gap-1.5 w-full bg-orange-red text-dark-bg font-body text-xs font-bold py-2.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
        >
          {loading ? "Loading..." : <>HANDSTAND 4 LIFE <ArrowRight className="w-3.5 h-3.5" /></>}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-white-dim">
          <Shield className="w-3 h-3" />
          <p className="font-body text-[10px]">30-day money-back guarantee</p>
        </div>
      </div>
    </motion.div>
  );
}