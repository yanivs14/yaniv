import React from "react";
import { motion } from "framer-motion";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftIntroVideo({ c }) {
  if (!c) return null;
  return (
    <section className="bg-dark-bg pb-10 lg:pb-14">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-5 text-center">{c.headline}</h2>
          <GiftVideo
            youtubeUrl={c.youtubeUrl}
            videoUrl={c.videoUrl}
            poster={c.poster}
            videoId="gift_intro"
            thumbnailLabel={c.thumbnailLabel}
            durationLabel={c.duration}
            onStarted={() => track("gift_intro_video_started")}
            onCompleted={() => track("gift_intro_video_completed")}
          />
        </motion.div>
      </div>
    </section>
  );
}