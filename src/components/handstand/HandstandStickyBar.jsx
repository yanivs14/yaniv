import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";

export default function HandstandStickyBar({ t = {} }) {
  const { isPreLaunch, stickyBarPreLaunch, stickyBarRegular, stickyBarCtaText } = useHandstandOffer(t);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const heroCta = document.getElementById("hero-cta");
    const purchase = document.getElementById("purchase");
    const footer = document.getElementById("footer");
    const sections = [heroCta, purchase, footer].filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const heroCtaVisible = entries.some((e) => e.target.id === "hero-cta" && e.isIntersecting);
        const purchaseVisible = entries.some((e) => e.target.id === "purchase" && e.isIntersecting);
        const footerVisible = entries.some((e) => e.target.id === "footer" && e.isIntersecting);
        setHidden(heroCtaVisible || purchaseVisible || footerVisible);
      },
      { threshold: 0.1 }
    );
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
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="font-heading text-sm font-bold text-off-white leading-none whitespace-nowrap">
        {isPreLaunch ? stickyBarPreLaunch : stickyBarRegular}
      </span>
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