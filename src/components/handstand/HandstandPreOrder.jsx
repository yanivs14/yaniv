import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";
import PreOrderHero from "@/components/handstand/preorder/PreOrderHero";
import PreOrderCurriculum from "@/components/handstand/preorder/PreOrderCurriculum";
import PreOrderClosing from "@/components/handstand/preorder/PreOrderClosing";
import PreOrderCountdown from "@/components/handstand/preorder/PreOrderCountdown";

let _checkoutInProgress = false;
async function startPreOrderCheckout() {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track("begin_checkout", { currency: "USD", plan_type: "handstand_preorder", page_state: "handstand_preorder" });
    const res = await base44.functions.invoke("createHandstandCheckout", { ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function HandstandPreOrder({ config, onUpdateVideo }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    await startPreOrderCheckout();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <PreOrderHero config={config} onCheckout={handleCheckout} loading={loading} onUpdateVideo={onUpdateVideo} />
      <PreOrderCurriculum />
      <PreOrderClosing config={config} onCheckout={handleCheckout} loading={loading} />

      {/* Sticky mobile checkout bar */}
      <div className="lg:hidden sticky bottom-0 z-50 bg-dark-bg/95 backdrop-blur-md border-t border-teal-500/30 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col">
          <span className="font-body text-[9px] text-teal-400 font-bold uppercase tracking-[0.12em] leading-tight">Special Pre-Order Price · Limited Time</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-heading text-lg font-bold text-off-white leading-none">${config.price}</span>
            <span className="font-body text-[11px] text-white-dim line-through">${config.originalPrice}</span>
          </div>
          <PreOrderCountdown targetDate={config.targetDate} compact />
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0"
        >
          {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}