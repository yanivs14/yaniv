import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftIntro({ c }) {
  if (!c) return null;
  return (
    <section id="top" className="bg-dark-bg pt-12 lg:pt-20 pb-14 lg:pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{c.eyebrow}</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-5">
            {c.headline}
          </h1>
          <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed max-w-2xl mx-auto mb-8">
            {c.supporting}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#practice"
              className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors w-full sm:w-auto"
            >
              {c.primaryCta} <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#membership"
              className="font-body text-sm font-semibold text-white-dim hover:text-white-muted transition-colors underline underline-offset-4"
            >
              {c.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 mt-10 lg:mt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-4 text-center">
            {c.introHeading}
          </h2>
          <GiftVideo
            youtubeUrl={c.introYoutubeUrl}
            videoUrl={c.introVideoUrl}
            poster={c.introPoster}
            videoId="gift_intro"
            overlay={c.introOverlay}
            subOverlay={c.introSubOverlay}
            onStarted={() => track("gift_intro_started")}
            onCompleted={() => track("gift_intro_completed")}
          />
        </motion.div>
      </div>
    </section>
  );
}