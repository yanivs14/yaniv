import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";

export default function AnnouncementBar({ t = {} }) {
  const {
    isPreLaunch, countdown, priceDisplay, nextPriceDisplay,
    announcementLeftText, announcementRightText, announcementCtaText,
    announcementNowAvailable, announcementOneTimePayment, announcementCountdownLabel, announcementMobileEndsLabel,
  } = useHandstandOffer(t);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_announcement_bar");
    setLoading(false);
  };

  const cd = `${countdown.days}d ${String(countdown.hours).padStart(2, "0")}h ${String(countdown.minutes).padStart(2, "0")}m ${String(countdown.seconds).padStart(2, "0")}s`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-md border-b border-orange-red/30">
      {/* Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-6 px-6 lg:px-10 h-11 max-w-[1250px] mx-auto">
        <span className="font-body text-[11px] font-bold text-orange-red uppercase tracking-widest whitespace-nowrap">
          {isPreLaunch ? announcementLeftText : announcementNowAvailable}
        </span>
        {isPreLaunch && (
          <div className="flex items-center gap-2">
            <span className="font-body text-[10px] text-white-dim uppercase tracking-wider whitespace-nowrap">{announcementCountdownLabel}</span>
            <span className="font-heading text-sm font-bold text-off-white tabular-nums">{cd}</span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="font-body text-[11px] font-bold text-off-white uppercase tracking-wider whitespace-nowrap">
            {isPreLaunch ? announcementRightText : `${priceDisplay} · ${announcementOneTimePayment}`}
          </span>
          <button onClick={handleClick} disabled={loading}
            className="flex items-center gap-1.5 bg-orange-red text-dark-bg font-body text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
            {loading ? "Loading..." : <>{announcementCtaText} <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
      {/* Mobile */}
      <div className="lg:hidden flex items-center justify-between gap-2 px-3 h-10">
        {isPreLaunch ? (
          <>
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <span className="font-heading text-sm font-bold text-orange-red whitespace-nowrap">$99</span>
              <span className="font-body text-[9px] text-white-dim uppercase tracking-wide whitespace-nowrap">{announcementMobileEndsLabel}</span>
              <span className="font-heading text-[11px] font-bold text-off-white tabular-nums truncate">{cd}</span>
            </div>
            <button onClick={handleClick} disabled={loading}
              className="flex items-center gap-1 bg-orange-red text-dark-bg font-body text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0">
              {loading ? "..." : <>{announcementCtaText} <ArrowRight className="w-3 h-3" /></>}
            </button>
          </>
        ) : (
          <>
            <span className="font-heading text-sm font-bold text-off-white">{priceDisplay} · {announcementOneTimePayment}</span>
            <button onClick={handleClick} disabled={loading}
              className="flex items-center gap-1 bg-orange-red text-dark-bg font-body text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 flex-shrink-0">
              {loading ? "..." : <>{announcementCtaText} <ArrowRight className="w-3 h-3" /></>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}