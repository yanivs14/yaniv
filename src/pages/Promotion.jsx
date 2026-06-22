import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Clock, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Footer from "@/components/landing/Footer";
import PromoNavbar from "@/components/promotion/PromoNavbar";
import PromotionPricing from "@/components/promotion/PromotionPricing";

const PAGE_KEY = "promotion";

const DEFAULTS = {
  headline: "Fix Your Pull Up In 7 Days",
  subtitle: "Not with more reps. Not with bands. With the one movement pattern your body has been missing.",
  description: "Arch Scap — the foundation of every pull, every hang, every strong back. Taught by Roye Gold. 10 min/day.",
  promoText: "$25/mo for the first 3 months if you sign up in the next 24 hours!",
  videoUrl: "",
  videoPosterUrl: "",
  ctaText: "START NOW →",
  ctaUrl: "",
  pricingEyebrow: "Membership",
  pricingTitle: "Join The Movement",
  pricingSubtitle: "Monthly — Cancel Anytime",
  pricingPlanName: "Monthly",
  pricingPrice: "$25",
  pricingPeriod: "/ month",
  pricingBadge: "Limited Time Offer",
  pricingPriceNote: "First 3 months only — then $35/mo",
  pricingCta: "Begin Monthly",
  pricingFooter: "Cancel anytime · No equipment needed",
  pricingFeatures: [
    "Personalized adaptive daily practice",
    "Full Movement training library (240+ sessions)",
    "Strength, mobility, control & longevity tracks",
    "Community access + challenges",
  ],
};

function VideoPlayer({ url, posterUrl, accent }) {
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

  const containerClass = isPortrait === true ? "mx-auto w-full max-w-xs" : "w-full";
  const aspectStyle = isPortrait === true ? { aspectRatio: "9/16" } : { aspectRatio: "16/9" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
      className="max-w-3xl mx-auto"
    >
      <div className={`relative rounded-2xl overflow-hidden bg-[#111] border border-[#1e3333] ${containerClass}`} style={aspectStyle}>
        <video
          ref={videoRef}
          src={url}
          poster={posterUrl || undefined}
          onLoadedMetadata={handleMetadata}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          controls={playing}
          preload="metadata"
          muted={!playing}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
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

export default function Promotion() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    base44.entities.PromotionPageContent.filter({ page_key: PAGE_KEY }).then(records => {
      setContent(records.length > 0 ? { ...DEFAULTS, ...records[0].data } : DEFAULTS);
    });
  }, []);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    const params = new URLSearchParams(window.location.search);
    window.dataLayer.push({
      event: "promotion_page_viewed",
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
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

  const handleCta = () => {
    if (content.ctaUrl) {
      window.location.href = content.ctaUrl;
    } else {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-body">
      <PromoNavbar />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="px-6 pt-16 pb-10 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="font-heading text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase tracking-tight text-[#F5F5F5] leading-[0.92]"
            >
              {content.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="font-body text-base sm:text-lg text-[#C8C8C8] leading-relaxed max-w-xl"
            >
              {content.subtitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="font-body text-sm sm:text-base text-[#888] leading-relaxed max-w-lg"
            >
              {content.description}
            </motion.p>
          </div>
        </section>

        {/* Video */}
        {content.videoUrl && (
          <section className="px-6 pb-10">
            <VideoPlayer url={content.videoUrl} posterUrl={content.videoPosterUrl} accent={accent} />
          </section>
        )}

        {/* Promo banner */}
        <section className="px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="max-w-2xl mx-auto"
          >
            <div
              className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #0a1515 0%, #0c0c0c 100%)",
                border: "1px solid rgba(0, 255, 247, 0.18)",
                boxShadow: "0 0 60px -20px rgba(0, 255, 247, 0.25)",
              }}
            >
              {/* Glow accents */}
              <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)` }} />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)` }} />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full" style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
                  <Clock className="w-4 h-4 animate-pulse" style={{ color: accent }} />
                  <p className="text-xs uppercase tracking-[0.3em] font-body font-bold" style={{ color: accent }}>
                    Limited Time Offer
                  </p>
                </div>
                <p className="font-heading text-2xl sm:text-3xl font-bold text-[#F5F5F5] leading-tight max-w-lg mx-auto">
                  {content.promoText}
                </p>
                <button
                  onClick={handleCta}
                  className="mt-7 inline-flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wider px-12 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-95 text-[#0a0a0a]"
                  style={{ backgroundColor: accent, boxShadow: `0 0 30px -8px ${accent}60` }}
                >
                  <Sparkles className="w-4 h-4" />
                  {content.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Pricing */}
        <PromotionPricing content={content} />
      </main>
      <Footer />
    </div>
  );
}