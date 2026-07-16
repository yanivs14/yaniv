import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";
import { useCountdown } from "@/components/handstand/preorder/PreOrderCountdown";

let _checkoutInProgress = false;
async function startCheckout() {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track("begin_checkout", { currency: "USD", plan_type: "handstand_course", page_state: "handstand_sticky_bar" });
    const res = await base44.functions.invoke("createHandstandCheckout", { ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

function CompactCountdown({ targetDate }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  if (expired || !targetDate) return null;
  const units = [
    { value: days }, { value: hours }, { value: minutes }, { value: seconds },
  ];
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {units.map((u, i) => (
        <React.Fragment key={i}>
          <span className="font-heading text-xs font-bold text-off-white tabular-nums leading-none">
            {String(u.value).padStart(2, "0")}
          </span>
          {i < units.length - 1 && <span className="text-white-dim text-[10px]">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function HandstandStickyBar({ price, ctaText, targetDate }) {
  const [loading, setLoading] = useState(false);
  const handleCheckout = async () => {
    setLoading(true);
    await startCheckout();
    setLoading(false);
  };
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-md border-t border-orange-red/30 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col">
        <span className="font-body text-[9px] text-orange-red font-bold uppercase tracking-[0.12em] leading-tight">Special Price · Limited Time</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-heading text-lg font-bold text-off-white leading-none">${price}</span>
          <CompactCountdown targetDate={targetDate} />
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0"
      >
        {loading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}