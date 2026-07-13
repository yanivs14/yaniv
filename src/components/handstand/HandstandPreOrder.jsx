import React, { useState, useEffect } from "react";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";

const MARQUEE_ITEMS = [
  "Pre-Order Now",
  "Lowest Price Ever",
  "Save 34%",
  "Early Access",
];

const PHASES = [
  { num: "01", title: "Foundation Phase", desc: "Bodyline, strength & stamina" },
  { num: "02", title: "Balance Phase", desc: "Enter, exit & rebalance" },
  { num: "03", title: "Movement Phase", desc: "Positions, transitions & control" },
  { num: "04", title: "Specialist Phase", desc: "Weight shifting & one-arm prep" },
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
          <div className="text-center">
            <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-red tabular-nums">
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-widest text-white-muted mt-0.5">{u.label}</div>
          </div>
          {i < units.length - 1 && <span className="font-heading text-xl sm:text-2xl text-white-dim">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PricingCard({ config, onCheckout, loading }) {
  return (
    <div className="bg-dark-surface border-2 border-orange-red rounded-2xl p-4 sm:p-6 lg:p-5 text-center">
      <p className="font-heading text-base sm:text-lg font-bold text-off-white uppercase tracking-tight mb-1">
        Lock In Our Lowest Price Ever
      </p>
      <p className="font-body text-xs text-white-muted mb-3">
        Pre-order now at the lowest price ever. Be first in line when we go live.
      </p>
      <div className="flex items-baseline justify-center gap-2 mb-3">
        <span className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white">${config.price}</span>
        <span className="font-heading text-lg sm:text-xl text-white-dim line-through">${config.originalPrice}</span>
        <span className="font-body text-xs font-semibold text-orange-red bg-orange-red/10 px-2 py-0.5 rounded-full">{config.discountText}</span>
      </div>
      <button
        onClick={onCheckout}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
      >
        {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="font-body text-[11px] text-white-muted mt-2">Pay today. Your access link arrives the moment we go live.</p>
      <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
        <span className="flex items-center gap-1 font-body text-[10px] text-white-dim"><Lock className="w-3 h-3" /> Secure</span>
        <span className="flex items-center gap-1 font-body text-[10px] text-white-dim"><InfinityIcon className="w-3 h-3" /> One-time</span>
        <span className="flex items-center gap-1 font-body text-[10px] text-white-dim"><Shield className="w-3 h-3" /> Lifetime</span>
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
      {/* Marquee */}
      <div className="bg-orange-red text-dark-bg py-1.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="font-heading text-xs font-bold uppercase tracking-widest mx-4">{item}</span>
          ))}
        </div>
      </div>

      {/* Desktop: one screen layout */}
      <div className="hidden lg:flex h-[calc(100vh-32px)] flex-col">
        <div className="flex-1 grid grid-cols-2 gap-8 max-w-7xl mx-auto w-full px-10 py-6 items-center">
          {/* Left: Hero + Countdown + Pricing */}
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-4xl xl:text-5xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
              Master Your<br />Handstand<br />In 4 Stages
            </h1>
            <p className="font-body text-sm text-white-muted leading-relaxed max-w-md">
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep.
            </p>
            <CountdownTimer targetDate={config.targetDate} />
            <div className="max-w-sm">
              <PricingCard config={config} onCheckout={handleCheckout} loading={loading} />
            </div>
          </div>

          {/* Right: Phases + Extras + Stats */}
          <div className="flex flex-col gap-4">
            <p className="font-heading text-sm font-bold text-off-white uppercase tracking-tight">
              From your first wall hold to one-arm mastery
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PHASES.map((p) => (
                <div key={p.num} className="bg-dark-surface border border-dark-border rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading text-lg font-bold text-orange-red">{p.num}</span>
                    <span className="font-heading text-sm font-bold text-off-white uppercase">{p.title}</span>
                  </div>
                  <p className="font-body text-[11px] text-white-muted">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-surface border border-dark-border rounded-xl p-3">
                <p className="font-heading text-xs font-bold text-off-white uppercase mb-0.5">Handstand Elements</p>
                <p className="font-body text-[10px] text-white-muted">Advanced dynamic transitions for movers who've locked in the basics.</p>
              </div>
              <div className="bg-dark-surface border border-dark-border rounded-xl p-3">
                <p className="font-heading text-xs font-bold text-off-white uppercase mb-0.5">Toolbox</p>
                <p className="font-body text-[10px] text-white-muted">Joint prep, wrist warm-ups & mobility drills for pain-free practice.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-heading text-xl font-bold text-orange-red">{s.value}</div>
                  <p className="font-body text-[10px] text-white-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: scrollable layout */}
      <div className="lg:hidden min-h-[calc(100vh-32px)]">
        <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-6">
          <div>
            <h1 className="font-heading text-4xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-3">
              Master Your Handstand In 4 Stages
            </h1>
            <p className="font-body text-base text-white-muted leading-relaxed">
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep.
            </p>
          </div>
          <CountdownTimer targetDate={config.targetDate} />
          <PricingCard config={config} onCheckout={handleCheckout} loading={loading} />

          <div>
            <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight mb-3">
              From your first wall hold to one-arm mastery
            </p>
            <div className="space-y-2">
              {PHASES.map((p) => (
                <div key={p.num} className="bg-dark-surface border border-dark-border rounded-xl p-3 flex items-start gap-3">
                  <span className="font-heading text-xl font-bold text-orange-red">{p.num}</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-off-white uppercase">{p.title}</p>
                    <p className="font-body text-xs text-white-muted">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight mb-3">Beyond the four steps</p>
            <div className="space-y-2">
              <div className="bg-dark-surface border border-dark-border rounded-xl p-3">
                <p className="font-heading text-sm font-bold text-off-white uppercase mb-1">Handstand Elements</p>
                <p className="font-body text-xs text-white-muted">For advanced movers. Mastered the Specialist Phase? Keep developing your skill with advanced, dynamic transitions.</p>
              </div>
              <div className="bg-dark-surface border border-dark-border rounded-xl p-3">
                <p className="font-heading text-sm font-bold text-off-white uppercase mb-1">Toolbox</p>
                <p className="font-body text-xs text-white-muted">Prep & mobility library. Joint preparation, wrist warm-ups, and mobility drills that keep your practice pain-free.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2">
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
              <span className="font-body text-xs font-semibold text-orange-red bg-orange-red/10 px-2 py-0.5 rounded-full">{config.discountText}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
            >
              {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}