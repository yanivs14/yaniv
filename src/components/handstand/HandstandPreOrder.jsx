import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon, Zap, Star, Check, Quote, ChevronDown } from "lucide-react";
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
  { num: "01", title: "Foundation", desc: "Bodyline, strength & stamina", points: ["Wrist prep & conditioning", "Hollow body holds", "Wall kick-up mechanics"] },
  { num: "02", title: "Balance", desc: "Enter, exit & rebalance", points: ["Chest-to-wall holds", "Toe pulls & heel pulls", "Freestanding entries"] },
  { num: "03", title: "Movement", desc: "Positions, transitions & control", points: ["Tuck, straddle & pike", "Shape transitions", "Pressing mechanics"] },
  { num: "04", title: "Specialist", desc: "Weight shifting & one-arm prep", points: ["Weight identification", "Block work & shifts", "One-arm conditioning"] },
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

const HERO_IMG = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=80";

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
            <div className="bg-gradient-to-b from-dark-surface to-dark-bg border border-orange-red/20 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-center min-w-[64px] sm:min-w-[88px] shadow-[0_0_30px_-10px_rgba(0,255,247,0.4)]">
              <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-red tabular-nums leading-none">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-white-muted mt-1.5">{u.label}</div>
            </div>
          </div>
          {i < units.length - 1 && <span className="font-heading text-2xl sm:text-3xl text-white-dim -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PricingCard({ config, onCheckout, loading, compact = false }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-red/40 via-orange-red/10 to-transparent rounded-3xl blur-md group-hover:blur-lg transition-all" />
      <div className={`relative bg-dark-surface/90 backdrop-blur-xl border border-orange-red/30 rounded-3xl ${compact ? "p-6" : "p-7 sm:p-8"} text-center`}>
        <p className="font-heading text-base sm:text-lg font-bold text-off-white uppercase tracking-tight mb-1">
          Lock In Our Lowest Price
        </p>
        <p className="font-body text-xs text-white-muted mb-5">
          Pre-order now. Be first in line when we go live.
        </p>
        <div className="flex items-baseline justify-center gap-3 mb-4">
          <span className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-off-white leading-none">${config.price}</span>
          <span className="font-heading text-xl sm:text-2xl text-white-dim line-through">${config.originalPrice}</span>
        </div>
        <span className="inline-block font-body text-xs font-bold text-dark-bg bg-orange-red px-4 py-1.5 rounded-full mb-5">{config.discountText}</span>
        <button
          onClick={onCheckout}
          disabled={loading}
          className="group/btn flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm sm:text-base font-bold py-4 rounded-2xl hover:bg-orange-red-hover transition-all disabled:opacity-60 shadow-[0_0_40px_-8px_rgba(0,255,247,0.6)] hover:shadow-[0_0_50px_-8px_rgba(0,255,247,0.8)]"
        >
          {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>}
        </button>
        <p className="font-body text-[11px] text-white-muted mt-4">Pay today. Your access link arrives the moment we go live.</p>
        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
          <span className="flex items-center gap-1 font-body text-[10px] text-white-muted"><Lock className="w-3 h-3 text-orange-red/60" /> Secure</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-white-muted"><InfinityIcon className="w-3 h-3 text-orange-red/60" /> One-time</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-white-muted"><Shield className="w-3 h-3 text-orange-red/60" /> Lifetime</span>
        </div>
      </div>
    </div>
  );
}

function PhaseAccordion({ phases }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {phases.map((p, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={p.num}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className={`w-full flex items-center gap-4 text-left bg-dark-surface/60 backdrop-blur-sm border rounded-2xl px-5 py-4 transition-colors ${isOpen ? "border-orange-red/50" : "border-dark-border hover:border-orange-red/30"}`}
            >
              <span className="font-heading text-2xl font-bold text-orange-red/40 flex-shrink-0">{p.num}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base sm:text-lg font-bold text-off-white uppercase tracking-tight">{p.title}</h3>
                <p className="font-body text-[11px] sm:text-xs text-white-muted truncate">{p.desc}</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-orange-red flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <ul className="grid sm:grid-cols-3 gap-2 pt-3 px-5 pb-1">
                {p.points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2 bg-dark-bg/50 border border-dark-border rounded-xl px-3 py-2.5">
                    <Check className="w-3.5 h-3.5 text-orange-red flex-shrink-0 mt-0.5" />
                    <span className="font-body text-xs text-white-muted">{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        );
      })}
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
    <div className="fixed inset-0 z-[100] bg-dark-bg overflow-y-auto">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-orange-red/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-red/4 rounded-full blur-[120px]" />
      </div>

      {/* Marquee */}
      <div className="relative bg-orange-red text-dark-bg py-2 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="font-heading text-xs font-bold uppercase tracking-[0.15em] mx-5 flex items-center gap-5">
              {item}
              <span className="text-dark-bg/30">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-16 lg:py-24 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/80 to-dark-bg" />
          </div>

          <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CountdownTimer targetDate={config.targetDate} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold leading-[0.92] text-off-white uppercase tracking-tight"
            >
              Master Your<br />
              Handstand In<br />
              <span className="text-orange-red">4 Stages</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-base lg:text-lg text-off-white font-medium leading-relaxed max-w-xl"
            >
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep — taught by Roye Gold.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-md"
            >
              <PricingCard config={config} onCheckout={handleCheckout} loading={loading} compact />
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="relative border-y border-dark-border bg-dark-surface/40 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="grid grid-cols-3 gap-4">
              {STATS.map((s, i) => (
                <div key={s.label} className={`text-center ${i < STATS.length - 1 ? "lg:border-r border-dark-border" : ""}`}>
                  <div className="font-heading text-3xl lg:text-4xl font-bold text-orange-red">{s.value}</div>
                  <p className="font-body text-xs text-white-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phases / Roadmap */}
        <section className="relative py-16 lg:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight">
                From your first wall hold<br />to <span className="text-orange-red">one-arm mastery</span>
              </h2>
            </motion.div>

            <PhaseAccordion phases={PHASES} />
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-16 lg:py-24 px-6 border-t border-dark-border">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight">
                Real students, <span className="text-orange-red">real results</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative bg-dark-surface/60 backdrop-blur-sm border border-dark-border rounded-2xl p-6 lg:p-8"
                >
                  <Quote className="w-8 h-8 text-orange-red/20 mb-4" />
                  <p className="font-body text-sm lg:text-base text-white-muted italic leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-red/30 to-orange-red/10 border border-orange-red/30 flex items-center justify-center font-heading text-base font-bold text-orange-red">{t.initial}</div>
                    <div>
                      <p className="font-body text-sm font-semibold text-off-white">{t.name}</p>
                      <p className="font-body text-[11px] text-white-muted">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-16 lg:py-24 px-6 border-t border-dark-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight mb-3">
              Ready to <span className="text-orange-red">go upside down?</span>
            </h2>
            <p className="font-body text-base text-white-muted mb-8">
              Pre-order now and save 34% before launch. Lifetime access, one-time payment.
            </p>
            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="font-heading text-5xl lg:text-6xl font-bold text-off-white">${config.price}</span>
              <span className="font-heading text-xl text-white-dim line-through">${config.originalPrice}</span>
              <span className="font-body text-xs font-bold text-dark-bg bg-orange-red px-3 py-1 rounded-full">{config.discountText}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="group inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-base font-bold px-10 py-4 rounded-2xl hover:bg-orange-red-hover transition-all disabled:opacity-60 shadow-[0_0_40px_-8px_rgba(0,255,247,0.6)] hover:shadow-[0_0_50px_-8px_rgba(0,255,247,0.8)]"
            >
              {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
            </button>
            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              <span className="flex items-center gap-1 font-body text-[11px] text-white-muted"><Lock className="w-3 h-3 text-orange-red/60" /> Secure checkout</span>
              <span className="flex items-center gap-1 font-body text-[11px] text-white-muted"><InfinityIcon className="w-3 h-3 text-orange-red/60" /> Lifetime access</span>
              <span className="flex items-center gap-1 font-body text-[11px] text-white-muted"><Shield className="w-3 h-3 text-orange-red/60" /> One-time payment</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}