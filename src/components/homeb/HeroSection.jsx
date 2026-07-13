import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Upload, Dumbbell, RefreshCcw } from "lucide-react";
import Quiz from "@/components/landing/Quiz";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";
import { trackQuizOpened } from "@/lib/analytics";
import { useSectionTracking } from "@/hooks/useSectionTracking";

export default function HeroSection() {
  const [quizOpen, setQuizOpen] = useState(false);
  const { content, update, adminMode } = useSiteContent();
  const c = content.hero;
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const heroRef = useSectionTracking("hero");

  const openQuiz = () => {
    trackQuizOpened("movement_quiz", "1.0");
    setQuizOpen(true);
  };

  useEffect(() => {
    const handler = () => setQuizOpen(true);
    window.addEventListener("open-quiz", handler);
    return () => window.removeEventListener("open-quiz", handler);
  }, []);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("hero", "videoUrl", file_url);
    setUploading(false);
  };

  return (
    <>
      <section ref={heroRef} className="pt-20 pb-10 lg:pt-32 lg:pb-20 bg-dark-bg" id="program">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
                {c.headline1}<br />
                {c.headline2} {c.headlineAccent}<br />
                {c.headline3.split(" ").map((word, i) => (
                  i === c.headline3.split(" ").length - 1
                    ? <span key={i} className="text-orange-red">{word}</span>
                    : <span key={i}>{word} </span>
                ))}
              </h1>

              <p className="mt-6 font-body text-lg lg:text-xl text-white-muted max-w-lg leading-relaxed">
                {c.subtitle}
              </p>

              <div className="mt-4 flex flex-col gap-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={openQuiz}
                    data-cta-id="hero_start_moving"
                    className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-base font-semibold px-9 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
                  >
                    {c.ctaPrimary}
                  </button>

                  <motion.a
                    href="#pricing"
                    data-cta-id="hero_take_quiz"
                    className="lg:hidden inline-flex items-center justify-center gap-2 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4 decoration-white-dim group"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {c.ctaSecondary}
                  </motion.a>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-body text-xs">
                  <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                    <Dumbbell className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                    {c.badge1}
                  </span>
                  <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                    <RefreshCcw className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                    {c.badge2}
                  </span>
                </div>
              </div>

              <div className="lg:hidden rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface mt-4">
                {c.videoUrl ? (
                  <video
                    src={c.videoUrl}
                    poster={c.videoPoster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={c.videoPoster}
                    alt="Hero visual"
                    className="w-full h-full object-cover"
                    fetchpriority="high"
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface relative group">
                {c.videoUrl ? (
                  <video
                    src={c.videoUrl}
                    poster={c.videoPoster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={c.videoPoster}
                    alt="Hero visual"
                    className="w-full h-full object-cover"
                    fetchpriority="high"
                  />
                )}

                {adminMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-orange-red text-dark-bg rounded-full font-body text-sm font-semibold hover:bg-orange-red-hover transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Video"}
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-dark-bg/80 text-off-white border border-dark-border rounded-full font-body text-sm hover:bg-dark-surface transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Poster Image
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        update("hero", "videoPoster", file_url);
                      }} />
                    </label>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {quizOpen && <Quiz onClose={() => setQuizOpen(false)} />}
      </AnimatePresence>
    </>
  );
}