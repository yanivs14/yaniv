import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { Play, ChevronDown, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

function GdprCheckbox({ id, checked, onChange }) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex-shrink-0 mt-0.5">
        <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <label
          htmlFor={id}
          className="flex items-center justify-center w-4 h-4 rounded border cursor-pointer transition-all duration-150"
          style={{ backgroundColor: checked ? "#00fff7" : "transparent", borderColor: checked ? "#00fff7" : "#444" }}
        >
          {checked && <Check className="w-2.5 h-2.5 text-[#0a0a0a]" strokeWidth={3} />}
        </label>
      </div>
      <label htmlFor={id} className="font-body text-[11px] text-[#aaa] leading-relaxed cursor-pointer">
        I agree to the processing of my personal data in accordance with the{" "}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[#ccc] hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
          Privacy Policy
        </a>
        . You may unsubscribe at any time.
      </label>
    </div>
  );
}

function Day2Newsletter({ accent, heading, subheading, ctaText }) {
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [gdprError, setGdprError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!gdpr) {
      setGdprError("Please agree to the Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke("subscribeNewsletter", { email: email.trim(), source: "7day_prep" });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  if (submitted) {
    return <p className="font-body text-sm font-semibold" style={{ color: accent }}>You're in! ✓</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <p className="font-heading text-xl font-bold uppercase tracking-tight text-[#F5F5F5]">{heading || "Ready for Day 2? Unlock it here."}</p>
      <p className="font-body text-sm text-[#888]">{subheading || "Keep the streak alive."}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            placeholder="your@email.com"
            className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] rounded-full px-4 py-2.5 font-body text-sm text-[#F5F5F5] placeholder-[#555] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex-shrink-0 px-5 py-2.5 rounded-full font-heading text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-60 text-[#0a0a0a]"
            style={{ backgroundColor: accent }}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
              : (ctaText || "Sign up now")}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 font-body">{error}</p>}
        <GdprCheckbox id="day2-gdpr" checked={gdpr} onChange={v => { setGdpr(v); setGdprError(""); }} />
        {gdprError && <p className="text-xs text-red-400 font-body">{gdprError}</p>}
      </form>
    </div>
  );
}

function MediaPlayer({ mediaUrl, mediaType, posterUrl, accent = "#00fff7", dayNumber = 1 }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'challenge_video_played', day_number: dayNumber });
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  const handleEnded = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'challenge_day_completed', day_number: dayNumber });
  };

  if (!mediaUrl || mediaType === "none") return null;

  if (mediaType === "image") {
    return (
      <div className="w-full flex justify-center">
        <img src={mediaUrl} alt="" className="max-w-xs w-full rounded-xl object-cover" />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="relative rounded-xl overflow-hidden bg-[#111] w-full max-w-xs" style={{ aspectRatio: "9/16" }}>
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={posterUrl || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          controls={playing}
          preload="auto"
          muted={!playing}
          onEnded={handleEnded}
        />
        {!playing && (
          <div className={`absolute inset-0 flex items-center justify-center ${posterUrl ? "" : "bg-black/30"}`}>
            <button
              onClick={handlePlay}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: accent }}
              aria-label="Play video"
            >
              <Play className="w-6 h-6 ml-1 text-[#0a0a0a]" fill="#0a0a0a" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DayRow({ d, accent, onJoin, mediaUrl, mediaType, posterUrl, todayNote, newsletterHeading, newsletterSubheading, newsletterCtaText }) {
  const rowRef = useRef(null);
  const btnRef = useRef(null);
  const labelRef = useRef(null);
  const isDay1 = d.day === 1;
  const isExpandable = d.day === 1 || d.day === 2;
  const [expanded, setExpanded] = useState(isExpandable);

  const handleEnter = () => {
    if (isExpandable) return;
    gsap.killTweensOf([rowRef.current, btnRef.current, labelRef.current]);
    gsap.to(rowRef.current, { backgroundColor: "#0d1a1a", duration: 0.35, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#F5F5F5", x: 4, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (isExpandable) return;
    gsap.killTweensOf([rowRef.current, btnRef.current, labelRef.current]);
    gsap.to(rowRef.current, { backgroundColor: "transparent", duration: 0.35, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#666", x: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
  };

  const rightSlot = () => {
    if (isExpandable) {
      return (
        <>
          {isDay1 && (
            <span
              className="text-xs font-body font-bold px-3 py-1 rounded-full whitespace-nowrap"
              style={{ backgroundColor: accent, color: "#0a0a0a" }}
            >
              TODAY
            </span>
          )}
          <ChevronDown
            className="w-4 h-4 transition-transform duration-300"
            style={{ color: accent, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </>
      );
    }

    return (
      <button
        ref={btnRef}
        onClick={onJoin}
        className="font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap"
        style={{ backgroundColor: accent, color: "#0a0a0a", opacity: 0 }}
      >
        Join Now
      </button>
    );
  };

  return (
    <div className={`border-b border-[#1e1e1e] ${isExpandable ? "-mx-4" : "-mx-2"}`}>
      <div
        ref={rowRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={isExpandable ? () => setExpanded(v => !v) : undefined}
        className={`flex items-center justify-between py-4 rounded-xl ${
          isExpandable ? "bg-[#0d1a1a] px-4 cursor-pointer" : "px-2 cursor-pointer"
        }`}
        style={{ minHeight: "60px" }}
      >
        <span
          className="font-heading text-xs font-bold flex-shrink-0 w-10 mr-2"
          style={{ color: isExpandable ? accent : "#888" }}
        >
          DAY {d.day}
        </span>

        <span
          ref={labelRef}
          className="font-heading text-lg sm:text-xl font-bold uppercase tracking-tight flex-1 min-w-0"
          style={{ color: isExpandable ? "#F5F5F5" : "#C8C8C8" }}
        >
          {d.title}
        </span>

        <div className="flex-shrink-0 ml-3 flex items-center gap-2">
          {rightSlot()}
        </div>
      </div>

      {isExpandable && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-6 pt-3 flex flex-col items-center gap-4">
                {todayNote && (
                  <p className="font-body text-sm text-[#888] text-center">{todayNote}</p>
                )}
                <MediaPlayer mediaUrl={mediaUrl} mediaType={mediaType} posterUrl={posterUrl} accent={accent} dayNumber={d.day} />
                <Day2Newsletter accent={accent} heading={newsletterHeading} subheading={newsletterSubheading} ctaText={newsletterCtaText} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}