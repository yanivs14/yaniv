import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";

export default function HandstandStickyBar({ t = {} }) {
  const { isPreLaunch, priceDisplay, stickyBarPreLaunch, stickyBarRegular, stickyBarCtaText } = useHandstandOffer(t);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(true);
  const observerRef = useRef(null);

  useEffect(() => {
    const sections = [
      document.getElementById("hero"),
      document.getElementById("purchase"),
      document.getElementById("footer"),
    ].filter(Boolean);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting);
        setHidden(anyVisible);
      },
      { threshold: 0.1 }
    );
    observerRef.current = observer;
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_sticky_bar");
    setLoading(false);
  };

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-bg/95 backdrop-blur-md border-t border-orange-red/30 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)] transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-body text-[9px] text-orange-red font-bold uppercase tracking-tight leading-none">
          {isPreLaunch ? stickyBarPreLaunch : stickyBarRegular}
        </span>
        <span className="font-heading text-xl font-bold text-off-white leading-none">{priceDisplay}</span>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 bg-orange-red text-dark-bg font-body text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0"
      >
        {loading ? "Loading..." : <>{stickyBarCtaText} <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}