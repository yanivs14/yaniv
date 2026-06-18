import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLANS = [
  {
    id: "annual",
    label: "Begin Annual",
    price: "$250",
    period: "/ year",
    note: "SAVE 40% · Billed Yearly",
    badge: "BEST VALUE — SAVE 40%",
    features: [
      "Everything in Monthly, plus:",
      "Weekly live coaching & feedback",
      "Exclusive member-only trainings",
      "Advanced content drops",
      "Priority access to new releases",
      "Annual member perks & content",
    ],
  },
  {
    id: "monthly",
    label: "Begin Monthly",
    price: "$35",
    period: "/ month",
    note: null,
    features: [
      "Personalized adaptive daily practice",
      "Full Movement training library (240+ sessions)",
      "Strength, mobility, control & longevity tracks",
      "Community access + challenges",
    ],
  },
];

export default function Movement7PricingModal({ open, onClose, accent = "#00fff7" }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'upsell_viewed', day_number: 4, source: '7day' });
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleSelect = async (plan) => {
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app.");
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'begin_checkout', plan_type: plan, source: '7day', currency: 'USD' });
    setLoading(plan);
    setError("");
    try {
      const res = await base44.functions.invoke("createMovement7Checkout", { plan });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5 sm:p-7">
              <p className="font-body text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: accent }}>7-Day Movement</p>
              <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-[#F5F5F5] mb-1">Choose Your Plan</h2>
              <p className="font-body text-sm text-[#888] mb-6">Full access to the 7-Day Movement program and community.</p>

              <div className="flex flex-col gap-3">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelect(plan.id)}
                    disabled={loading !== null}
                    className="relative w-full text-left rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:border-[#00fff7]/60 group disabled:opacity-60"
                    style={{ backgroundColor: "#0a0a0a", borderColor: "#2a2a2a" }}
                  >
                    {plan.badge && (
                      <span
                        className="absolute top-2.5 right-2.5 font-heading text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[#0a0a0a]"
                        style={{ backgroundColor: accent }}
                      >
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-end gap-2 mb-1">
                      <span className="font-heading text-3xl sm:text-4xl font-bold text-[#F5F5F5]">{plan.price}</span>
                      <span className="font-body text-sm text-[#888] mb-1">{plan.period}</span>
                    </div>
                    {plan.note && <p className="font-body text-xs mb-3" style={{ color: accent }}>{plan.note}</p>}
                    <ul className="space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 font-body text-[11px] text-[#aaa]">
                          <Check className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-heading text-sm font-bold uppercase text-[#F5F5F5]">{plan.label}</span>
                      <span className="font-body text-[10px] text-[#555]">Cancel anytime</span>
                      {loading === plan.id ? (
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent, borderTopColor: "transparent" }} />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#00fff7] transition-colors" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 text-xs text-red-400 font-body text-center">{error}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}