import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon } from "lucide-react";

const MARQUEE_ITEMS = [
  "Lowest Price Ever",
  "Save 34%",
  "Early Access",
  "Lifetime Access",
  "Pre-Order Now",
];

const HERO_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a2656cd64_generated_image.png";

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    };
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function Marquee() {
  return (
    <div className="relative bg-orange-red text-dark-bg py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="font-heading text-xs font-bold uppercase tracking-[0.15em] mx-5 flex items-center gap-5">
            {item}
            <span className="text-dark-bg/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CountdownTimer({ targetDate }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  if (expired) return null;
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-teal-400/20 rounded-2xl blur-sm" />
            <div className="relative bg-white border border-gray-200 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[64px] sm:min-w-[88px] shadow-sm">
              <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600 tabular-nums leading-none">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-gray-500 mt-1.5">{u.label}</div>
            </div>
          </motion.div>
          {i < units.length - 1 && <span className="font-heading text-2xl sm:text-3xl text-gray-300 -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PricingCard({ config, onCheckout, loading }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-b from-teal-400/40 via-teal-400/10 to-transparent rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-white border border-teal-400/30 rounded-3xl p-7 sm:p-8 text-center shadow-lg">
        <p className="font-heading text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight mb-1">
          Lock In Our Lowest Price
        </p>
        <p className="font-body text-xs text-gray-500 mb-5">
          Pre-order now. Be first in line when we go live.
        </p>
        <div className="flex items-baseline justify-center gap-3 mb-4">
          <span className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-none">${config.price}</span>
          <span className="font-heading text-xl sm:text-2xl text-gray-300 line-through">${config.originalPrice}</span>
        </div>
        <span className="inline-block font-body text-xs font-bold text-dark-bg bg-orange-red px-4 py-1.5 rounded-full mb-5">{config.discountText}</span>
        <button
          onClick={onCheckout}
          disabled={loading}
          className="group/btn flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm sm:text-base font-bold py-4 rounded-2xl hover:bg-orange-red-hover transition-all disabled:opacity-60 shadow-[0_4px_20px_-4px_rgba(0,255,247,0.5)]"
        >
          {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>}
        </button>
        <p className="font-body text-[11px] text-gray-500 mt-4">Pay today. Your access link arrives the moment we go live.</p>
        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
          <span className="flex items-center gap-1 font-body text-[10px] text-gray-500"><Lock className="w-3 h-3 text-teal-500" /> Secure</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-gray-500"><InfinityIcon className="w-3 h-3 text-teal-500" /> One-time</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-gray-500"><Shield className="w-3 h-3 text-teal-500" /> Lifetime</span>
        </div>
      </div>
    </div>
  );
}

export default function PreOrderHero({ config, onCheckout, loading }) {
  return (
    <>
      <Marquee />
      <section className="relative min-h-screen lg:min-h-[88vh] flex items-center px-6 py-14 lg:py-16 overflow-hidden bg-gray-50">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/85 to-white" />
        </div>
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-400/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left: countdown + headline + subtitle */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <CountdownTimer targetDate={config.targetDate} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] text-gray-900 uppercase tracking-tight"
            >
              Master Your<br />
              Handstand In<br />
              <span className="text-teal-600">4 Stages</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-base lg:text-lg text-gray-600 font-medium leading-relaxed max-w-xl"
            >
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep — taught by Roye Gold.
            </motion.p>
          </div>

          {/* Right: pricing card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-md mx-auto lg:max-w-none"
          >
            <PricingCard config={config} onCheckout={onCheckout} loading={loading} />
          </motion.div>
        </div>
      </section>
    </>
  );
}