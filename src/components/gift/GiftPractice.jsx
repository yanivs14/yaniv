import React from "react";
import { motion } from "framer-motion";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftPractice({ c, onPracticeStart }) {
  if (!c) return null;

  return (
    <section id="practice" className="bg-dark-surface py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        {/* Compact prep strip */}
        {c.prep && c.prep.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4 mb-10 lg:mb-12"
          >
            {c.prep.map((item, i) => (
              <div key={i} className="flex-1 flex items-center gap-3 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 lg:px-5 lg:py-4">
                <span className="font-heading text-xs lg:text-sm font-bold text-orange-red uppercase tracking-tight whitespace-nowrap">{item.title}</span>
                <span className="font-body text-xs lg:text-sm text-white-muted leading-snug">{item.desc}</span>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {c.eyebrow && <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-3">
            {c.heading}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto mb-2">{c.supporting}</p>
          {c.durationLabel && (
            <span className="inline-flex items-center bg-orange-red/10 border border-orange-red/30 rounded-full px-3 py-1 font-heading text-xs font-bold text-orange-red uppercase tracking-wide">
              {c.durationLabel}
            </span>
          )}
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <GiftVideo
            youtubeUrl={c.practiceYoutubeUrl}
            videoUrl={c.practiceVideoUrl}
            poster={c.practicePoster}
            videoId="gift_practice"
            overlay={c.practiceOverlay}
            subOverlay={c.practiceSubOverlay}
            onStarted={() => {
              track("gift_practice_started");
              if (onPracticeStart) onPracticeStart();
            }}
            on25={() => track("gift_practice_25")}
            on50={() => track("gift_practice_50")}
            on75={() => track("gift_practice_75")}
            onCompleted={() => track("gift_practice_completed")}
          />
        </div>
      </div>
    </section>
  );
}