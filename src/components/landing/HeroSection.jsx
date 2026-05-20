import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Upload, Dumbbell, RefreshCcw } from "lucide-react";
import Quiz from "./Quiz";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";

export default function HeroSection() {
  const [quizOpen, setQuizOpen] = useState(false);
  const { content, update, adminMode } = useSiteContent();
  const c = content.hero;
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

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
      <section className="pt-16 pb-10 lg:pt-32 lg:pb-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
                {c.headline1}<br />
                {c.headline2} <span className="text-orange-red">{c.headlineAccent}</span><br />
                {c.headline3}
              </h1>
              <p className="mt-6 font-body text-base lg:text-lg text-white-muted max-w-md leading-relaxed">
                {c.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 font-body text-xs">
                <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                  <Dumbbell className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                  {c.badge1}
                </span>
                <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                  <RefreshCcw className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                  {c.badge2}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-4 relative z-10">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors sm:self-start"
                >
                  {c.ctaPrimary}
                </a>

                <motion.button
                  onClick={() => setQuizOpen(true)}
                  className="inline-flex items-center justify-center gap-2 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4 decoration-white-dim group sm:self-start"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {c.ctaSecondary}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>

                {/* Mobile video — overlaps buttons above, sits behind them */}
                <div className="lg:hidden rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface relative -mt-28 -z-10">
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
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right - Video / Image (desktop only) */}
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
                  />
                )}

                {/* Upload overlay (admin mode) */}
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