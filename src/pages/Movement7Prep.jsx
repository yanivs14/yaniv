import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Footer from "@/components/landing/Footer";
import DayRow from "@/components/movement7prep/DayRow";
import Movement7PricingModal from "@/components/movement7prep/Movement7PricingModal";

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
  introHeading: "Welcome to the 7 Day Movement Prep",
  introSubheading: "To help you get started — Start with Day 1 for free",
};


function IntroVideoPlayer({ url, accent }) {
  const [playing, setPlaying] = useState(false);
  const [isPortrait, setIsPortrait] = useState(null);
  const videoRef = useRef(null);

  const handleMetadata = () => {
    const v = videoRef.current;
    if (v) setIsPortrait(v.videoHeight > v.videoWidth);
  };

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  const containerClass = isPortrait === true
    ? "mx-auto w-full max-w-xs"
    : "w-full";

  const aspectStyle = isPortrait === true
    ? { aspectRatio: "9/16" }
    : { aspectRatio: "16/9" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
      className="mb-10"
    >
      <div className={`relative rounded-2xl overflow-hidden bg-[#111] border border-[#1e3333] ${containerClass}`} style={aspectStyle}>
        <video
          ref={videoRef}
          src={url}
          onLoadedMetadata={handleMetadata}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          controls={playing}
          preload="metadata"
          muted={!playing}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
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
    </motion.div>
  );
}

export default function Movement7Prep() {
  const [content, setContent] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    base44.entities.PrepPageContent.filter({ page_key: PAGE_KEY }).then(records => {
      setContent(records.length > 0 ? { ...DEFAULTS, ...records[0].data } : DEFAULTS);
    });
  }, []);

  // seven_day_page_viewed — fires on every visit
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'seven_day_page_viewed',
      page: '7day_prep',
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      const sessionId = params.get("session_id") || "";
      base44.functions.invoke("getCheckoutSession", { session_id: sessionId })
        .then(res => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'purchase_complete',
            plan_type: res.data?.plan_type || 'unknown',
            source: '7day',
            currency: res.data?.currency || 'USD',
            transaction_id: res.data?.transaction_id || sessionId,
            value: res.data?.value || 0,
          });
        })
        .catch(() => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'purchase_complete', source: '7day', currency: 'USD', transaction_id: sessionId, value: 0 });
        });
    }
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
      <Movement7PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} accent={accent} />
      <main className="flex-1">

        {/* ── INTRO HEADING + VIDEO (first section) ── */}
        {(content.introHeading || content.introSubheading || content.introVideoUrl) && (
          <section className="px-6 pt-14 pb-8 flex flex-col items-center text-center">
            <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-4">
              {content.introHeading && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  className="font-heading text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase tracking-tight text-[#F5F5F5] leading-[0.92]"
                >
                  {content.introHeading}
                </motion.h1>
              )}
              {content.introSubheading && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-body text-base sm:text-lg text-[#C8C8C8] leading-relaxed max-w-xl"
                >
                  {content.introSubheading}
                </motion.p>
              )}
              {content.introVideoUrl && (
                <div className="w-full mt-2">
                  <IntroVideoPlayer url={content.introVideoUrl} accent={accent} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── HERO ── */}
        <section className="px-6 py-14 lg:py-20 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="font-heading text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase tracking-tight text-[#F5F5F5] leading-[0.92]"
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
              {/* WHO IT'S FOR */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex-1 overflow-hidden rounded-2xl text-left cursor-default group"
                style={{ background: "linear-gradient(145deg, #0d1a1a 0%, #111 100%)", border: "1px solid #1e3333" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ boxShadow: `inset 0 0 40px 0 ${accent}18` }} />
                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                <div className="px-6 py-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-4 font-body font-bold" style={{ color: accent }}>Who it's for</p>
                  <ul className="flex flex-col gap-2.5">
                    {content.whoFor.split(/[✓,]/).map(item => item.trim()).filter(Boolean).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-body text-sm text-[#C8C8C8]">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7.5" stroke={accent} strokeOpacity="0.3" />
                          <path d="M4.5 8l2.5 2.5L11.5 5.5" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* WHAT YOU'LL GAIN */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex-1 overflow-hidden rounded-2xl text-left cursor-default group"
                style={{ background: "linear-gradient(145deg, #0d1a1a 0%, #111 100%)", border: "1px solid #1e3333" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ boxShadow: `inset 0 0 40px 0 ${accent}18` }} />
                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                <div className="px-6 py-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-4 font-body font-bold" style={{ color: accent }}>What you'll gain</p>
                  <ul className="flex flex-col gap-2.5">
                    {content.whatGain.split(/[✓,]/).map(item => item.trim()).filter(Boolean).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-body text-sm text-[#C8C8C8]">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7.5" stroke={accent} strokeOpacity="0.3" />
                          <path d="M4.5 8l2.5 2.5L11.5 5.5" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>


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
                >
                  <DayRow
                    d={d}
                    i={i}
                    accent={accent}
                    onJoin={() => setPricingOpen(true)}
                    mediaUrl={d.day === 1 ? content.mediaUrl : undefined}
                    mediaType={d.day === 1 ? content.mediaType : undefined}
                    posterUrl={d.day === 1 ? content.posterUrl : undefined}
                    todayNote={d.day === 1 ? content.todayNote : undefined}
                  />
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
                <button
                  onClick={() => setPricingOpen(true)}
                  className="inline-flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wider px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                  style={{ backgroundColor: accent }}
                >
                  {content.afterDaysCtaText} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
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