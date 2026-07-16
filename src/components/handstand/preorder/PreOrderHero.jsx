import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon, Upload, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
            <div className="relative bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 text-center min-w-[56px] sm:min-w-[80px] shadow-sm">
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-600 tabular-nums leading-none">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-gray-500 mt-1">{u.label}</div>
            </div>
          </motion.div>
          {i < units.length - 1 && <span className="font-heading text-xl sm:text-2xl text-gray-300 -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PricingCard({ config, onCheckout, loading }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-b from-teal-400/40 via-teal-400/10 to-transparent rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-white border border-teal-400/30 rounded-2xl p-5 sm:p-6 text-center shadow-lg">
        <p className="font-heading text-sm sm:text-base font-bold text-gray-900 uppercase tracking-tight mb-1">
          Lock In Our Lowest Price
        </p>
        <p className="font-body text-xs text-gray-500 mb-4">
          Pre-order now. Be first in line when we go live.
        </p>
        <div className="flex items-baseline justify-center gap-2.5 mb-3">
          <span className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 leading-none">${config.price}</span>
          <span className="font-heading text-lg sm:text-xl text-gray-300 line-through">${config.originalPrice}</span>
        </div>
        <span className="inline-block font-body text-xs font-bold text-dark-bg bg-orange-red px-3 py-1 rounded-full mb-4">{config.discountText}</span>
        <button
          onClick={onCheckout}
          disabled={loading}
          className="group/btn flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-2xl hover:bg-orange-red-hover transition-all disabled:opacity-60 shadow-[0_4px_20px_-4px_rgba(0,255,247,0.5)]"
        >
          {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>}
        </button>
        <p className="font-body text-[11px] text-gray-500 mt-3">Pay today. Your access link arrives the moment we go live.</p>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <span className="flex items-center gap-1 font-body text-[10px] text-gray-500"><Lock className="w-3 h-3 text-teal-500" /> Secure</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-gray-500"><InfinityIcon className="w-3 h-3 text-teal-500" /> One-time</span>
          <span className="flex items-center gap-1 font-body text-[10px] text-gray-500"><Shield className="w-3 h-3 text-teal-500" /> Lifetime</span>
        </div>
      </div>
    </div>
  );
}

function VideoBlock({ config, isAdmin, onUpdateVideo }) {
  const [uploading, setUploading] = useState(null);
  const poster = config.videoPoster || HERO_IMG;

  const handleUpload = async (e, kind) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(kind);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUpdateVideo(kind === "video" ? "videoUrl" : "videoPoster", file_url);
    } catch {
      setUploading(null);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] bg-gray-200 shadow-xl group">
      {config.videoUrl ? (
        <video src={config.videoUrl} poster={poster} autoPlay muted loop playsInline className="w-full h-full object-cover" />
      ) : (
        <img src={poster} alt="Handstand training with Roye Gold" className="w-full h-full object-cover" fetchpriority="high" />
      )}
      {isAdmin && (
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-orange-red text-dark-bg rounded-full font-body text-sm font-semibold hover:bg-orange-red-hover transition-colors">
            <Upload className="w-4 h-4" />
            {uploading === "video" ? "Uploading..." : "Upload Video"}
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleUpload(e, "video")} />
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-dark-bg/80 text-off-white border border-dark-border rounded-full font-body text-sm hover:bg-dark-surface transition-colors">
            <Upload className="w-4 h-4" />
            {uploading === "poster" ? "Uploading..." : "Upload Poster Image"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "poster")} />
          </label>
        </div>
      )}
    </div>
  );
}

export default function PreOrderHero({ config, onCheckout, loading, onUpdateVideo }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (!authed) return;
      base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => {});
    }).catch(() => {});
  }, []);

  return (
    <>
      <Marquee />
      {/* Countdown — top, centered */}
      <div className="bg-gray-50 pt-7 pb-1 px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-teal-600 mb-3"
        >
          Special Pre-Order Price · Limited Time
        </motion.p>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <CountdownTimer targetDate={config.targetDate} />
        </motion.div>
      </div>

      <section className="relative px-6 pb-14 lg:pb-20 pt-6 lg:pt-8 overflow-hidden bg-gray-50">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/85 to-white" />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-400/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: headline + sub */}
          <div className="flex flex-col gap-5 text-center lg:text-left order-1 lg:col-start-1 lg:row-start-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold leading-[0.9] text-gray-900 uppercase tracking-tight"
            >
              Master Your<br />
              Handstand In<br />
              <span className="text-teal-600">4 Stages</span>
            </motion.h1>

            <div className="flex flex-col gap-3 max-w-xl mx-auto lg:mx-0">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-heading text-xl sm:text-2xl font-bold text-gray-900 leading-tight"
              >
                Handstands are a skill, not a talent.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-body text-base lg:text-lg text-gray-600 leading-relaxed"
              >
                A clear, four-stage video path that takes you from your first wall hold to advanced balance work. Each phase builds on the last — with bonus challenges once you've mastered the basics.
              </motion.p>
            </div>
          </div>

          {/* Right: video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2"
          >
            <VideoBlock config={config} isAdmin={isAdmin} onUpdateVideo={onUpdateVideo} />
          </motion.div>

          {/* Left: pricing card (below sub-headline) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-sm mx-auto lg:mx-0 order-3 lg:col-start-1 lg:row-start-2"
          >
            <PricingCard config={config} onCheckout={onCheckout} loading={loading} />
          </motion.div>
        </div>

        {/* What you get */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-6xl mx-auto mt-8 lg:mt-10"
        >
          <div className="bg-gradient-to-b from-teal-50/60 to-white border-2 border-teal-500 rounded-2xl p-6 sm:p-8 shadow-lg">
            <p className="font-heading text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-teal-600 mb-5 sm:mb-6 text-center">What you get</p>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                "All 4 phases — Wall hold to freestanding",
                "2 bonus libraries: Elements + Toolbox",
                "Lifetime access — no subscription",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/10 flex-shrink-0">
                    <Check className="w-4 h-4 text-teal-600" strokeWidth={3} />
                  </span>
                  <span className="font-body text-sm sm:text-base font-medium text-gray-800 sm:whitespace-nowrap">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}