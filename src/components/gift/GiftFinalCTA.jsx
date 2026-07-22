import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";

let _checkoutInProgress = false;
async function startCheckout(plan, email) {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) { alert("Checkout is only available from the published app."); return; }
  _checkoutInProgress = true;
  try {
    track(plan === "annual" ? "gift_final_annual_clicked" : "gift_final_monthly_clicked", { plan });
    track("checkout_started", { plan, source: "gift_final_cta" });
    const res = await base44.functions.invoke("createCheckout", { plan, ga_client_id: getGaClientId(), email: email || undefined });
    if (res.data?.url) window.location.href = res.data.url;
  } finally { _checkoutInProgress = false; }
}

export default function GiftFinalCTA({ c, email, onCheckoutStart }) {
  const [loading, setLoading] = useState(null);
  if (!c) return null;

  const handleCheckout = async (plan) => {
    setLoading(plan);
    onCheckoutStart?.();
    await startCheckout(plan, email);
    setLoading(null);
  };

  return (
    <section className="bg-dark-surface py-12 lg:py-16 border-t border-dark-border">
      <div className="max-w-2xl mx-auto px-6 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-dark-bg border border-dark-border rounded-3xl px-6 py-10 lg:py-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">{c.headline}</h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-xl mx-auto mb-7">{c.copy}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <button onClick={() => handleCheckout("annual")} disabled={loading === "annual"} className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-all w-full sm:w-auto disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-orange-red/30">
              {loading === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{c.primaryCta} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button onClick={() => handleCheckout("monthly")} disabled={loading === "monthly"} className="font-body text-sm font-bold text-off-white border border-dark-border rounded-full px-7 py-3.5 hover:border-orange-red/50 transition-colors w-full sm:w-auto disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-orange-red/10">
              {loading === "monthly" ? <Loader2 className="w-4 h-4 animate-spin" /> : c.secondaryCta}
            </button>
          </div>
          <a href="#practice" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors underline underline-offset-4">{c.returnLink}</a>
        </motion.div>
      </div>
    </section>
  );
}