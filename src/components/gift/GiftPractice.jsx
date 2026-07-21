import React from "react";
import { motion } from "framer-motion";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftPractice({ c }) {
  if (!c) return null;

  return (
    <section id="practice" className="bg-dark-surface py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">
            {c.heading}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto">{c.supporting}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-12">
          {c.instructions?.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative bg-gradient-to-b from-dark-surface-2 to-dark-bg border border-dark-border rounded-2xl p-7 lg:p-8 flex flex-col items-center text-center overflow-hidden hover:border-orange-red/40 transition-colors"
            >
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-orange-red rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-dark-bg border-2 border-orange-red/50 text-orange-red font-heading font-bold text-xl lg:text-2xl flex items-center justify-center mb-5 shadow-[0_0_24px_-4px_rgba(0,255,247,0.4)]">
                {i + 1}
              </span>
              <p className="font-heading text-lg lg:text-xl font-bold text-off-white uppercase tracking-tight mb-2.5 leading-tight">{item.title}</p>
              <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <GiftVideo
            youtubeUrl={c.practiceYoutubeUrl}
            videoUrl={c.practiceVideoUrl}
            poster={c.practicePoster}
            videoId="movement_reset_practice"
            onStarted={() => track("movement_reset_video_started")}
            on50={() => track("movement_reset_video_50_percent")}
            onCompleted={() => track("movement_reset_video_completed")}
          />
        </div>
      </div>
    </section>
  );
}