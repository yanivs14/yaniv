import React, { useState, useEffect } from "react";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon, Zap, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";

const MARQUEE_ITEMS = [
  "Pre-Order Now",
  "Lowest Price Ever",
  "Save 34%",
  "Early Access",
  "Lifetime Access",
];

const PHASES = [
  { num: "01", title: "Foundation", desc: "Bodyline, strength & stamina" },
  { num: "02", title: "Balance", desc: "Enter, exit & rebalance" },
  { num: "03", title: "Movement", desc: "Positions, transitions & control" },
  { num: "04", title: "Specialist", desc: "Weight shifting & one-arm prep" },
];

const STATS = [
  { value: "1,200+", label: "Students trained" },
  { value: "4.9/5", label: "Average rating" },
  { value: "15+ yrs", label: "Coaching handstands" },
];

const TESTIMONIALS = [
  { initial: "M", name: "Maya R.", role: "Foundation → Balance", quote: "I went from barely holding a wall stand to my first freestanding handstand in weeks. The step-by-step phases finally made it click." },
  { initial: "D", name: "Daniel K.", role: "Calisthenics athlete", quote: "Roye breaks down alignment better than any coach I've worked with. Clear, no fluff, and the progressions actually build on each other." },
];

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
          <div className="relative">
            <div className="bg-dark-surface/80 backdrop-blur-sm border border-orange-red/30 rounded-xl px-3 py-2 sm:px-5 sm:py-3 text-center min-w-[58px] sm:min-w-[80px] shadow-[0_0_20px_-5px_rgba(0,255,247,0.3)]">
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-red tabular-nums">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-widest text-white-muted mt-0.5">{u.label}</div>
            </div>
          </div>
          {i < units.length - 1 && <span className="font-heading text-lg sm:text-2xl text-white-dim -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PricingCard({ config, onCheckout, loading }) {
  return (
    <div className="relative">
      <div className="absolute -inset-px bg-gradient-to-b from-orange-red/40 to-orange-red/0 rounded-2xl blur-sm" />
      <div className="relative bg-dark-surface border border-orange-red/50 rounded-2xl p-5 sm:p-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-orange-red/10 border border-orange-red/30 rounded-full px-3 py-1 mb-3">
          <Zap className="w-3 h-3 text-orange-red" />
          <span className="font-body text-[10px] font-bold text-orange-red uppercase tracking-widest">Lowest Price Ever</span>
        </div>
        <p className="font-heading text-sm sm:text-base font-bold text-off-white uppercase tracking-tight mb-1">
          Lock In Our Lowest Price Ever
        </p>
        <p className="font-body text-xs text-white-muted mb-4">
          Pre-order now. Be first in line when we go live.
        </p>
        <div className="flex items-baseline justify-center gap-2 mb-4">
          <span className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white">${config.price}</span>
          <span className="font-heading text-lg sm:text-xl text-white-dim line-through">${config.originalPrice}</span>
        </div>
        <span className="inline-block font-body text-xs font-bold text-dark-bg bg-orange-red px-3 py-1 rounded-full mb-4">{config.discountText}</span>
        <button
          onClick={onCheckout}
          disabled={loading}
          className="group flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm sm:text-base font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-all disabled:opacity-60 shadow-[0_0_30px_-5px_rgba(0,255,247,0.5)] hover:shadow-[0_0_40px_-5px_rgba(0,255,247,0.7)]"
        >
          {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>
        <p className="font-body text-[11px] text-white-muted mt-3">Pay today. Your access link arrives the moment we go live.</p>
        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
          <span className="flex items-center gap-1 font-body text-[10px] text-white-dim"><Lock className="w-3 h-3" /> Secure</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-white-dim"><InfinityIcon className="w-3 h-3" /> One-time</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-white-dim"><Shield className="w-3 h-3" /> Lifetime</span>
        </div>
      </div>
    </div>
  );
}

function PhaseStrip() {
  return (
    <div className="w-full max-w-5xl">
      <p className="text-center font-body text-xs font-bold text-white-muted uppercase tracking-widest mb-3">
        From your first wall hold to one-arm mastery
      </p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {PHASES.map((p, i) => (
          <div key={p.num} className="relative group">
            {i > 0 && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-px bg-dark-border hidden sm:block" />}
            <div className="bg-dark-surface/60 backdrop-blur-sm border border-dark-border rounded-xl p-2.5 sm:p-3.5 text-center hover:border-orange-red/40 transition-colors">
              <div className="font-heading text-base sm:text-xl font-bold text-orange-red/80 mb-0.5">{p.num}</div>
              <div className="font-heading text-[11px] sm:text-sm font-bold text-off-white uppercase mb-0.5">{p.title}</div>
              <p className="font-body text-[9px] sm:text-[10px] text-white-muted leading-tight hidden sm:block">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HandstandPreOrder({ config }) {
  const [loading, setLoading] = useState(false);
  const handleCheckout = async () => {
    setLoading(true);
    await startPreOrderCheckout();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg overflow-y-auto lg:overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-red/8 rounded-full blur-[120px]" />
      </div>

      {/* Marquee */}
      <div className="relative bg-orange-red text-dark-bg py-1.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="font-heading text-xs font-bold uppercase tracking-widest mx-4 flex items-center gap-4">
              {item}
              <span className="text-dark-bg/40">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Desktop: 3-column one-screen layout */}
      <div className="relative hidden lg:flex h-[calc(100vh-32px)] items-center justify-center px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 xl:gap-10 items-center w-full max-w-7xl">
          {/* Left: Phases 01-02 */}
          <div className="flex flex-col gap-3 max-w-[200px] xl:max-w-[240px] ml-auto">
            <p className="font-body text-[10px] font-bold text-white-muted uppercase tracking-widest text-center mb-1">
              From your first wall hold
            </p>
            {PHASES.slice(0, 2).map((p) => (
              <div key={p.num} className="bg-dark-surface/60 backdrop-blur-sm border border-dark-border rounded-xl p-3.5 hover:border-orange-red/40 transition-colors">
                <div className="font-heading text-lg font-bold text-orange-red/80 mb-0.5">{p.num}</div>
                <div className="font-heading text-xs font-bold text-off-white uppercase mb-0.5">{p.title}</div>
                <p className="font-body text-[10px] text-white-muted leading-tight">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Center: Hero + Countdown + Pricing */}
          <div className="flex flex-col items-center text-center gap-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-orange-red/10 border border-orange-red/30 rounded-full px-4 py-1.5">
              <Star className="w-3 h-3 text-orange-red fill-orange-red" />
              <span className="font-body text-[10px] font-bold text-orange-red uppercase tracking-widest">Limited Pre-Order · Early Access</span>
            </div>

            <h1 className="font-heading text-4xl xl:text-5xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
              Master Your Handstand<br />
              In <span className="text-orange-red">4 Stages</span>
            </h1>

            <p className="font-body text-sm text-white-muted leading-relaxed max-w-lg">
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep.
            </p>

            <CountdownTimer targetDate={config.targetDate} />

            <div className="w-full max-w-sm">
              <PricingCard config={config} onCheckout={handleCheckout} loading={loading} />
            </div>
          </div>

          {/* Right: Phases 03-04 */}
          <div className="flex flex-col gap-3 max-w-[200px] xl:max-w-[240px] mr-auto">
            <p className="font-body text-[10px] font-bold text-white-muted uppercase tracking-widest text-center mb-1">
              to one-arm mastery
            </p>
            {PHASES.slice(2, 4).map((p) => (
              <div key={p.num} className="bg-dark-surface/60 backdrop-blur-sm border border-dark-border rounded-xl p-3.5 hover:border-orange-red/40 transition-colors">
                <div className="font-heading text-lg font-bold text-orange-red/80 mb-0.5">{p.num}</div>
                <div className="font-heading text-xs font-bold text-off-white uppercase mb-0.5">{p.title}</div>
                <p className="font-body text-[10px] text-white-muted leading-tight">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: scrollable layout */}
      <div className="relative lg:hidden min-h-[calc(100vh-32px)]">
        <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center gap-1.5 bg-orange-red/10 border border-orange-red/30 rounded-full px-4 py-1.5">
              <Star className="w-3 h-3 text-orange-red fill-orange-red" />
              <span className="font-body text-[10px] font-bold text-orange-red uppercase tracking-widest">Limited Pre-Order</span>
            </div>
            <h1 className="font-heading text-4xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
              Master Your Handstand<br />In <span className="text-orange-red">4 Stages</span>
            </h1>
            <p className="font-body text-base text-white-muted leading-relaxed">
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep.
            </p>
          </div>
          <CountdownTimer targetDate={config.targetDate} />
          <PricingCard config={config} onCheckout={handleCheckout} loading={loading} />

          <div>
            <p className="font-body text-xs font-bold text-white-muted uppercase tracking-widest mb-3 text-center">
              From your first wall hold to one-arm mastery
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PHASES.map((p) => (
                <div key={p.num} className="bg-dark-surface border border-dark-border rounded-xl p-3 flex items-start gap-2.5">
                  <span className="font-heading text-lg font-bold text-orange-red/80">{p.num}</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-off-white uppercase">{p.title}</p>
                    <p className="font-body text-[10px] text-white-muted">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-dark-border">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-heading text-2xl font-bold text-orange-red">{s.value}</div>
                <p className="font-body text-[10px] text-white-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-dark-surface border border-dark-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-red/20 flex items-center justify-center font-heading text-sm font-bold text-orange-red">{t.initial}</div>
                  <div>
                    <p className="font-body text-sm font-semibold text-off-white">{t.name}</p>
                    <p className="font-body text-[10px] text-white-muted">{t.role}</p>
                  </div>
                </div>
                <p className="font-body text-xs text-white-muted italic">"{t.quote}"</p>
              </div>
            ))}
          </div>

          <div className="text-center py-4 border-t border-dark-border">
            <p className="font-heading text-xl font-bold text-off-white uppercase mb-1">Get the Handstands program</p>
            <p className="font-body text-sm text-white-muted mb-3">Pre-order now and save 34% before launch.</p>
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <span className="font-heading text-3xl font-bold text-off-white">${config.price}</span>
              <span className="font-heading text-lg text-white-dim line-through">${config.originalPrice}</span>
              <span className="font-body text-xs font-bold text-dark-bg bg-orange-red px-2 py-0.5 rounded-full">{config.discountText}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
            >
              {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}