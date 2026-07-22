import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";

function BarCountdown() {
  const { countdown, isPreLaunch } = useHandstandOffer();
  if (!isPreLaunch) return null;
  const { days, hours, minutes, seconds } = countdown;
  return (
    <span className="font-heading text-sm font-bold text-off-white tabular-nums">
      {days}d {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
    </span>
  );
}

export default function AnnouncementBar({ c }) {
  const { isPreLaunch, priceDisplay, nextPriceDisplay, ctaText } = useHandstandOffer();
  const [loading, setLoading] = useState(false);

  const scrollToPricing = () => {
    document.getElementById("purchase")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClick = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_announcement_bar");
    setLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-md border-b border-orange-red/30">
      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-6 px-6 lg:px-10 h-11 max-w-[1250px] mx-auto">
        <span className="font-body text-[11px] font-bold text-orange-red uppercase tracking-widest whitespace-nowrap">
          {isPreLaunch ? c?.leftText : "NOW AVAILABLE"}
        </span>
        {isPreLaunch && (
          <div className="flex items-center gap-2">
            <span className="font-body text-[10px] text-white-dim uppercase tracking-wider">Pre-launch price ends in</span>
            <BarCountdown />
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="font-body text-[11px] font-bold text-off-white uppercase tracking-wider whitespace-nowrap">
            {isPreLaunch ? `${priceDisplay} NOW · ${nextPriceDisplay} FROM AUGUST 3` : `${priceDisplay} · One-time payment`}
          </span>
          <button
            onClick={handleClick}
            disabled={loading}
            className="flex items-center gap-1.5 bg-orange-red text-dark-bg font-body text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : <>{ctaText.replace("Get the Handstand Course — ", "GET THE COURSE")} <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between gap-2 px-3 h-10">
        {isPreLaunch ? (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-heading text-sm font-bold text-orange-red whitespace-nowrap">$99</span>
              <span className="font-body text-[9px] text-white-dim uppercase tracking-wide whitespace-nowrap">· ENDS</span>
              <BarCountdown />
            </div>
            <button
              onClick={handleClick}
              disabled={loading}
              className="flex items-center gap-1 bg-orange-red text-dark-bg font-body text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {loading ? "..." : <>GET COURSE <ArrowRight className="w-3 h-3" /></>}
            </button>
          </>
        ) : (
          <>
            <span className="font-heading text-sm font-bold text-off-white">${149} · One-time</span>
            <button
              onClick={handleClick}
              disabled={loading}
              className="flex items-center gap-1 bg-orange-red text-dark-bg font-body text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {loading ? "..." : <>GET COURSE <ArrowRight className="w-3 h-3" /></>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}