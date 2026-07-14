import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon, ChevronRight } from "lucide-react";

const MARQUEE_ITEMS = ["Lowest Price Ever", "Save 34%", "Early Access", "Lifetime Access", "Pre-Order Now"];
const HERO_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a2656cd64_generated_image.png";

function useCountdown(targetDate) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), expired: false };
    };
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

function TopMarquee() {
  return (
    <div className="relative bg-orange-red text-dark-bg py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="font-body text-xs font-bold uppercase tracking-[0.15em] mx-5 flex items-center gap-5">
            {item}<span className="text-dark-bg/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CountdownTimer({ targetDate }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  if (expired) return null;
  const units = [{ label: "Days", value: days }, { label: "Hours", value: hours }, { label: "Min", value: minutes }, { label: "Sec", value: seconds }];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[64px] sm:min-w-[88px] shadow-sm">
            <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600 tabular-nums leading-none">{String(u.value).padStart(2, "0")}</div>
            <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-slate-400 mt-1.5">{u.label}</div>
          </div>
          {i < units.length - 1 && <span className="font-display text-2xl sm:text-3xl text-slate-300 -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PricingCard({ config, onCheckout, loading }) {
  return (
    <div className="relative bg-white border border-slate-200/60 rounded-3xl p-7 sm:p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <p className="font-display text-base sm:text-lg font-semibold text-[#0a1b33] mb-1">Lock In Our Lowest Price</p>
      <p className="font-body text-xs text-slate-500 mb-5">Pre-order now. Be first in line when we go live.</p>
      <div className="flex items-baseline justify-center gap-3 mb-4">
        <span className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[#0a1b33] leading-none">${config.price}</span>
        <span className="font-display text-xl sm:text-2xl text-slate-300 line-through">${config.originalPrice}</span>
      </div>
      <span className="inline-block font-body text-xs font-bold text-dark-bg bg-orange-red px-4 py-1.5 rounded-full mb-5">{config.discountText}</span>
      <button onClick={onCheckout} disabled={loading} className="group/btn flex items-center justify-center gap-2 w-full bg-[#0a152d] text-white font-body text-sm sm:text-base font-semibold py-4 rounded-full hover:bg-[#0a1b33] transition-all disabled:opacity-60">
        {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>}
      </button>
      <p className="font-body text-[11px] text-slate-400 mt-4">Pay today. Your access link arrives the moment we go live.</p>
      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
        <span className="flex items-center gap-1 font-body text-[10px] text-slate-400"><Lock className="w-3 h-3 text-teal-500" /> Secure</span>
        <span className="flex items-center gap-1 font-body text-[10px] text-slate-400"><InfinityIcon className="w-3 h-3 text-teal-500" /> One-time</span>
        <span className="flex items-center gap-1 font-body text-[10px] text-slate-400"><Shield className="w-3 h-3 text-teal-500" /> Lifetime</span>
      </div>
    </div>
  );
}

function FloatingNav({ onCheckout }) {
  return (
    <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40">
      <div className="flex items-center justify-center w-9 h-9 bg-white border border-slate-100 rounded-full shadow-sm text-teal-600 text-sm">✦</div>
      <button onClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })} className="font-body text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors px-4 py-2">Curriculum</button>
      <button onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })} className="font-body text-[12px] font-semibold text-slate-500 hover:text-[#0a1b33] transition-colors px-4 py-2">Reviews</button>
      <button onClick={onCheckout} className="flex items-center gap-1 bg-white px-5 py-2 rounded-full font-body text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all">
        Pre-order <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.nav>
  );
}

export default function PreOrderHero({ config, onCheckout, loading }) {
  return (
    <>
      <TopMarquee />
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4">
        <div className="relative w-full rounded-[48px] bg-white border border-slate-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[600px]">
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            <img src={HERO_IMG} alt="" className="w-full h-full object-cover scale-105 transition-transform duration-1000 opacity-10" />
          </div>
          <div className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 pb-24 flex flex-col items-center text-center gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <CountdownTimer targetDate={config.targetDate} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-[42px] md:text-[56px] font-medium tracking-tight text-[#0a1b33] leading-[1.05]">
              Master Your<br />Handstand In<br /><span className="text-teal-600">4 Stages</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-[14px] md:text-[15px] text-[#64748b] max-w-xl leading-relaxed">
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep — taught by Roye Gold.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="w-full max-w-md">
              <PricingCard config={config} onCheckout={onCheckout} loading={loading} />
            </motion.div>
          </div>
          <FloatingNav onCheckout={onCheckout} />
        </div>
      </div>
    </>
  );
}