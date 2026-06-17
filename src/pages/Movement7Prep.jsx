import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Footer from "@/components/landing/Footer";

const PAGE_KEY = "movement7prep";

const DAYS = [
  { day: 1, title: "Hang / Spinal Wave" },
  { day: 2, title: "Joint Prep / Push" },
  { day: 3, title: "Hang / Pull" },
  { day: 4, title: "Juggling / Diagonal Stretch" },
  { day: 5, title: "Joint Prep / Handstand" },
  { day: 6, title: "Hang / Flow" },
  { day: 7, title: "Joint Prep / Legs" },
];

const DEFAULTS = {
  title: "7-Day Movement Preparation",
  description: "A structured 7-day program to give you a soft landing into movement and help you understand the foundations everything else is built on.",
  whoFor: "Beginners to advanced. No experience needed.",
  whatGain: "Better mobility, strength, coordination, and confidence in how your body moves.",
  days: DAYS,
  todayNote: "10 minutes. That's the only job today.",
  mediaUrl: "",
  mediaType: "none",
  ctaText: "START DAY 1 →",
  ctaUrl: "",
  communityHeadline: "This is just the entry point.",
  communityBody: "Inside Roye's Skool community, 800+ members get the full movement library, weekly live coaching, and ongoing programming — this challenge is the warm-up.",
  communityCtaText: "Join The Community",
  communityCtaUrl: "https://www.skool.com",
  heroCta1Text: "START THE CHALLENGE →",
  heroCta1Url: "",
  afterDaysCtaText: "START NOW →",
  afterDaysCtaUrl: "",
};

function MediaPlayer({ mediaUrl, mediaType, accent = "#00fff7" }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  if (!mediaUrl || mediaType === "none") return null;

  if (mediaType === "image") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="relative rounded-2xl overflow-hidden bg-[#111]"
      style={{ display: "inline-block", maxWidth: "100%" }}
    >
      <video
        ref={videoRef}
        src={mediaUrl}
        className="block max-w-full"
        style={{ maxHeight: "80vh" }}
        playsInline
        controls={playing}
        preload="metadata"
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <button
            onClick={handlePlay}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: accent }}
            aria-label="Play video"
          >
            <Play className="w-8 h-8 text-[#0a0a0a] ml-1" fill="#0a0a0a" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Movement7Prep() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    base44.entities.PrepPageContent.filter({ page_key: PAGE_KEY }).then(records => {
      setContent(records.length > 0 ? { ...DEFAULTS, ...records[0].data } : DEFAULTS);
    });
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00fff7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const accent = "#00fff7";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-body">
      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="px-6 py-20 lg:py-28 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.25em] font-body"
              style={{ color: accent }}
            >
              The Movement
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="font-heading text-[clamp(3rem,10vw,7rem)] font-bold uppercase tracking-tight text-[#F5F5F5] leading-[0.88]"
            >
              {content.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="font-body text-base sm:text-lg text-[#C8C8C8] leading-relaxed max-w-xl"
            >
              {content.description}
            </motion.p>

            {/* Who / What */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            >
              <div className="flex-1 max-w-xs bg-[#161616] border border-[#2a2a2a] rounded-2xl px-6 py-5 text-left">
                <p className="text-xs uppercase tracking-widest mb-2 font-body" style={{ color: accent }}>Who it's for</p>
                <p className="font-body text-sm text-[#C8C8C8] leading-relaxed">{content.whoFor}</p>
              </div>
              <div className="flex-1 max-w-xs bg-[#161616] border border-[#2a2a2a] rounded-2xl px-6 py-5 text-left">
                <p className="text-xs uppercase tracking-widest mb-2 font-body" style={{ color: accent }}>What you'll gain</p>
                <p className="font-body text-sm text-[#C8C8C8] leading-relaxed">{content.whatGain}</p>
              </div>
            </motion.div>

            {/* Hero CTA */}
            {content.heroCta1Text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              >
                <a
                  href={content.heroCta1Url || "#"}
                  className="inline-flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wider px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                  style={{ backgroundColor: accent }}
                >
                  {content.heroCta1Text} <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── THE PROGRAM ── */}
        <section className="px-6 pb-20 lg:pb-28">
          <div className="max-w-3xl mx-auto w-full">

            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
              className="mb-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] mb-2 font-body" style={{ color: accent }}>The Program</p>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#F5F5F5]">7 Days.</h2>
              <p className="font-body text-sm text-[#888] mt-2">Each day = 2 focused movement patterns. 10 minutes minimum.</p>
            </motion.div>

            {/* Days list */}
            <div className="mt-6 border-t border-[#1e1e1e]">
              {(content.days || DAYS).map((d, i) => (
                <motion.div
                  key={d.day}
                  initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`flex items-center justify-between py-4 border-b border-[#1e1e1e] group ${d.day === 1 ? "bg-[#0d1a1a] -mx-4 px-4 rounded-xl" : ""}`}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className="font-heading text-xs font-bold w-14 flex-shrink-0"
                      style={{ color: d.day === 1 ? accent : "#333" }}
                    >
                      DAY {d.day}
                    </span>
                    <span
                      className={`font-heading text-xl font-bold uppercase tracking-tight ${d.day === 1 ? "text-[#F5F5F5]" : "text-[#666]"}`}
                    >
                      {d.title}
                    </span>
                  </div>
                  {d.day === 1 && (
                    <span className="text-xs font-body font-bold px-3 py-1 rounded-full" style={{ backgroundColor: accent, color: "#0a0a0a" }}>
                      TODAY
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Routine note */}
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="font-body text-xs text-[#555] mt-5 leading-relaxed"
            >
              Do all 7 days in a row, or rest in between — just don't rest more than 1 day at a time.
            </motion.p>

            {/* After Days CTA */}
            {content.afterDaysCtaText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-8 flex justify-center"
              >
                <a
                  href={content.afterDaysCtaUrl || "#"}
                  className="inline-flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wider px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                  style={{ backgroundColor: accent }}
                >
                  {content.afterDaysCtaText} <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── TODAY: DAY 1 ── */}
        <section className="px-6 pb-20 lg:pb-28">
          <div className="max-w-3xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
              className="bg-[#161616] border border-[#2a2a2a] rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] font-body" style={{ color: accent }}>Today</p>
              <h2 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#F5F5F5] leading-tight">
                Day 1 — Hang / Spinal Wave
              </h2>
              <p className="font-body text-base text-[#888]">{content.todayNote}</p>

              {/* Media */}
              {content.mediaUrl && content.mediaType !== "none" && (
                <div className="w-full flex justify-center">
                  <MediaPlayer mediaUrl={content.mediaUrl} mediaType={content.mediaType} accent={accent} />
                </div>
              )}

              {/* CTA */}
              {content.ctaText && (
                content.ctaUrl ? (
                  <a
                    href={content.ctaUrl}
                    className="inline-flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wider px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                    style={{ backgroundColor: accent }}
                  >
                    {content.ctaText} <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wider px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                    style={{ backgroundColor: accent }}
                  >
                    {content.ctaText} <ArrowRight className="w-4 h-4" />
                  </button>
                )
              )}
            </motion.div>
          </div>
        </section>

        {/* ── WANT MORE ── */}
        <section className="px-6 pb-24 lg:pb-32">
          <div className="max-w-3xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="border-t border-[#1e1e1e] pt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8"
            >
              <div className="flex flex-col gap-4 max-w-lg">
                <p className="text-xs uppercase tracking-[0.2em] font-body" style={{ color: accent }}>Want more than 7 days?</p>
                <h2 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#F5F5F5] leading-[0.9]">
                  {content.communityHeadline}
                </h2>
                <p className="font-body text-sm text-[#888] leading-relaxed">
                  {content.communityBody}
                </p>
              </div>
              <a
                href={content.communityCtaUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-full border transition-colors hover:bg-[#00fff7] hover:text-[#0a0a0a] hover:border-[#00fff7] text-[#F5F5F5] whitespace-nowrap"
                style={{ borderColor: "#2a2a2a" }}
              >
                {content.communityCtaText} <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}