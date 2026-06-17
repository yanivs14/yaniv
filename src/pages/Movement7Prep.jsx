import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Footer from "@/components/landing/Footer";

const PAGE_KEY = "movement7prep";

const DEFAULTS = {
  title: "7-Day Movement Prep",
  subtitle: "Your body is ready. Are you?",
  description: "A focused 7-day program designed to prepare your body for real movement — improving mobility, activating key muscle groups, and building the foundation you need before you begin.",
  mediaUrl: "",
  mediaType: "none",
  ctaText: "Get Started",
  ctaUrl: "",
};

function MediaPlayer({ mediaUrl, mediaType, accent = "#00fff7" }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 50);
  };

  if (!mediaUrl || mediaType === "none") return null;

  if (mediaType === "image") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full rounded-2xl overflow-hidden bg-[#111]"
      style={{ aspectRatio: "16/9" }}
    >
      <video
        ref={videoRef}
        src={mediaUrl}
        className="w-full h-full object-cover"
        playsInline
        controls={playing}
        preload="metadata"
        poster=""
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
      if (records.length > 0) {
        setContent({ ...DEFAULTS, ...records[0].data });
      } else {
        setContent(DEFAULTS);
      }
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 lg:py-32">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-8">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.25em] font-body"
            style={{ color: accent }}
          >
            The Movement
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading text-[clamp(3rem,10vw,7rem)] font-bold uppercase tracking-tight text-[#F5F5F5] leading-[0.88]"
          >
            {content.title}
          </motion.h1>

          {/* Subtitle */}
          {content.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight"
              style={{ color: accent }}
            >
              {content.subtitle}
            </motion.p>
          )}

          {/* Description */}
          {content.description && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.18 }}
              className="font-body text-base sm:text-lg text-[#C8C8C8] leading-relaxed max-w-2xl"
            >
              {content.description}
            </motion.p>
          )}

          {/* Media */}
          {content.mediaUrl && content.mediaType !== "none" && (
            <div className="w-full">
              <MediaPlayer mediaUrl={content.mediaUrl} mediaType={content.mediaType} accent={accent} />
            </div>
          )}

          {/* CTA */}
          {content.ctaText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            >
              {content.ctaUrl ? (
                <a
                  href={content.ctaUrl}
                  className="inline-flex items-center gap-2 font-body text-sm font-bold px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                  style={{ backgroundColor: accent }}
                >
                  {content.ctaText}
                </a>
              ) : (
                <button
                  className="inline-flex items-center gap-2 font-body text-sm font-bold px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]"
                  style={{ backgroundColor: accent }}
                >
                  {content.ctaText}
                </button>
              )}
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}