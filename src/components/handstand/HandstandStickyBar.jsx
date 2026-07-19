import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId, trackMetaAddToCart } from "@/lib/analytics";
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
    trackMetaAddToCart({ value: 97, currency: "USD", planType: "handstand_course", planLabel: "Handstand Course" });
    const res = await base44.functions.invoke("createHandstandCheckout", { ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

function CompactCountdown({ targetDate }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  if (expired || !targetDate) return null;
  const units = [days, hours, minutes, seconds];
  return (
    <div className="flex items-center gap-1">
      {units.map((v, i) => (
        <React.Fragment key={i}>
          <span className="font-heading text-sm font-bold text-off-white tabular-nums leading-none">
            {String(v).padStart(2, "0")}
          </span>
          {i < units.length - 1 && <span className="text-white-dim text-[10px] font-bold">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function HandstandStickyBar({ price, ctaText, targetDate }) {
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const sections = [
      document.getElementById("hero"),
      document.getElementById("pricing"),
    ].filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting);
        setHidden(anyVisible);
      },
      { threshold: 0.15 }
    );
    observerRef.current = observer;
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    await startCheckout();
    setLoading(false);
  };

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-md border-t border-orange-red/30 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)] transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-body text-[9px] text-orange-red font-bold uppercase tracking-tight leading-none whitespace-nowrap">
          Special Price · Limited Time
        </span>
        <div className="flex items-center gap-2.5">
          {targetDate && (
            <>
              <CompactCountdown targetDate={targetDate} />
              <span className="w-px h-7 bg-dark-border flex-shrink-0" />
            </>
          )}
          <span className="font-heading text-xl font-bold text-off-white leading-none">${price}</span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 bg-orange-red text-dark-bg font-body text-xs font-bold px-4 sm:px-6 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0"
      >
        {loading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}