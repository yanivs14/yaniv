import React from "react";
import { motion } from "framer-motion";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftPractice({ c, onVideoStarted }) {
  if (!c) return null;
  return (
    <section id="practice" className="bg-dark-surface py-10 lg:py-14">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-2">{c.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-3">{c.headline}</h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto">{c.supporting}</p>
        </motion.div>
        <div className="max-w-3xl mx-auto">
          <GiftVideo
            youtubeUrl={c.youtubeUrl}
            videoUrl={c.videoUrl}
            poster={c.poster}
            videoId="gift_practice"
            thumbnailLabel={c.thumbnailLabel}
            thumbnailSub={c.thumbnailSub}
            durationLabel={c.duration}
            onStarted={() => { track("gift_practice_video_started"); onVideoStarted?.(); }}
            on25={() => track("gift_practice_video_25")}
            on50={() => track("gift_practice_video_50")}
            on75={() => track("gift_practice_video_75")}
            onCompleted={() => track("gift_practice_video_completed")}
          />
        </div>
      </div>
    </section>
  );
}