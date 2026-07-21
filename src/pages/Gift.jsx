import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";
import GdprConsent from "@/components/landing/GdprConsent";
import PricingSection from "@/components/homeb/PricingSection";
import { trackLeadCapture } from "@/lib/analytics";

const STORAGE_KEY = "gift_unlocked_until";
const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

function isUnlocked() {
  const until = localStorage.getItem(STORAGE_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

function unlock() {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + ONE_MONTH));
}

export default function Gift() {
  const [content, setContent] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setUnlocked(isUnlocked());
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "gift" });
        if (pages.length > 0 && pages[0].data) {
          setContent({ ...defaultGiftContent, ...pages[0].data });
        } else {
          setContent(defaultGiftContent);
        }
      } catch {
        setContent(defaultGiftContent);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!gdpr) {
      setError("Please accept the privacy policy to continue");
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke("subscribeNewsletter", { email: email.trim(), source: "gift_page" });
      trackLeadCapture(email.trim(), "gift_page", gdpr, "");
      unlock();
      setUnlocked(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleVideoPlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const gate = content.gate;
  const video = content.video;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          {gate.eyebrow && (
            <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{gate.eyebrow}</p>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-3 leading-tight">
            {gate.headline}
          </h1>
          <p className="font-body text-sm text-white-muted mb-7 leading-relaxed">{gate.subheadline}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              className={`w-full bg-dark-surface border rounded-xl px-5 py-3.5 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${error ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
            />
            {error && <p className="text-xs text-red-400 font-body">{error}</p>}
            <GdprConsent id="gift-gdpr" checked={gdpr} onChange={(v) => { setGdpr(v); setError(""); }} />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{gate.ctaText} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
          {gate.footnote && <p className="mt-4 text-center font-body text-xs text-white-dim">{gate.footnote}</p>}
        </motion.div>
      </div>
    );
  }

  const isPortrait = video.posterAspect === "vertical";
  const containerAspect = isPortrait ? "9 / 16" : "16 / 9";

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight mb-4 leading-tight">
            {video.title}
          </h1>
          {video.description && (
            <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto">{video.description}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl overflow-hidden bg-black border border-dark-border w-full relative ${isPortrait ? "max-w-sm mx-auto" : ""}`}
          style={{ aspectRatio: containerAspect }}
        >
          {video.videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.posterUrl || undefined}
                controls={playing}
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="w-full h-full object-contain"
              />
              {!playing && (
                <button
                  onClick={handleVideoPlay}
                  onTouchStart={(e) => { e.preventDefault(); handleVideoPlay(); }}
                  className="absolute inset-0 w-full h-full group flex items-center justify-center cursor-pointer bg-black"
                >
                  {video.posterUrl && <img src={video.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                  <span className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <span className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
                  </span>
                </button>
              )}
            </>
          ) : video.posterUrl ? (
            <img src={video.posterUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">
              Add a video in the admin editor
            </div>
          )}
        </motion.div>
      </div>

      <PricingSection />
    </div>
  );
}