import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftIntro({ c }) {
  if (!c) return null;
  return (
    <section id="top" className="bg-dark-bg pt-12 lg:pt-20 pb-14 lg:pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-orange-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-6 h-px bg-orange-red/50" />
            <p className="font-body text-[11px] text-orange-red uppercase tracking-widest">{c.eyebrow}</p>
            <span className="w-6 h-px bg-orange-red/50" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-5">
            {c.headline}
          </h1>
          <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed max-w-2xl mx-auto mb-8">
            {c.supporting}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#practice"
              className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-all hover:shadow-[0_8px_30px_-8px_rgba(0,255,247,0.5)] w-full sm:w-auto"
            >
              {c.primaryCta} <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#membership"
              className="font-body text-sm font-semibold text-white-muted border border-dark-border rounded-full px-7 py-3.5 hover:border-orange-red/50 hover:text-off-white transition-colors w-full sm:w-auto"
            >
              {c.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 mt-10 lg:mt-14 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-6 h-px bg-white-dim" />
            <h2 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight text-center">
              {c.beforeHeading}
            </h2>
            <span className="w-6 h-px bg-white-dim" />
          </div>
          <GiftVideo
            youtubeUrl={c.introYoutubeUrl}
            videoUrl={c.introVideoUrl}
            poster={c.introPoster}
            videoId="movement_reset_intro"
            onStarted={() => track("movement_reset_intro_video_started")}
            onCompleted={() => track("movement_reset_intro_video_completed")}
          />
          <p className="font-body text-sm text-white-muted leading-relaxed mt-4 max-w-2xl mx-auto text-center">
            {c.beforeNote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}