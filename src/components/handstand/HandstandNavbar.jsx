import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useCountdown } from "@/components/handstand/preorder/PreOrderCountdown";

export default function HandstandNavbar({ c, targetDate }) {
  const [visible, setVisible] = useState(false);
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  useEffect(() => {
    const onScroll = () => {
      // Show navbar after scrolling past the hero (roughly 80vh)
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`hidden lg:block fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <span className="font-heading text-xl font-bold text-off-white uppercase tracking-tight flex-shrink-0">
          {c?.brandName || "Handstand"}
        </span>
        {targetDate && !expired && (
          <div className="hidden lg:flex items-center gap-2.5 flex-1 justify-center">
            <span className="font-body text-[11px] text-orange-red font-bold uppercase tracking-[0.12em] whitespace-nowrap">Special Early Bird Price · Ends in</span>
            <div className="flex items-center gap-1">
              {[
                { label: "d", value: days },
                { label: "h", value: hours },
                { label: "m", value: minutes },
                { label: "s", value: seconds },
              ].map((u, i) => (
                <React.Fragment key={u.label}>
                  <span className="font-heading text-sm font-bold text-off-white tabular-nums bg-dark-surface border border-orange-red/20 rounded-md px-2 py-0.5">
                    {String(u.value).padStart(2, "0")}{u.label}
                  </span>
                  {i < 3 && <span className="text-white-dim text-xs">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={scrollToPricing}
          data-cta-id="handstand_nav_cta"
          className="flex items-center gap-1.5 bg-orange-red text-dark-bg font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors flex-shrink-0"
        >
          {c?.navCtaText || "Enroll Now"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}