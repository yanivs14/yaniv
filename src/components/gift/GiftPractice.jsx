import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftPractice({ c, onComplete }) {
  const [feedback, setFeedback] = useState(null); // "complete" | "later"

  if (!c) return null;

  const handleComplete = () => {
    setFeedback("complete");
    track("movement_reset_completed");
    if (onComplete) onComplete();
  };

  const handleLater = () => {
    setFeedback("later");
  };

  return (
    <section id="practice" className="bg-dark-surface py-14 lg:py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">
            {c.heading}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto">{c.supporting}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-10">
          {c.instructions?.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-dark-bg border border-dark-border rounded-2xl p-6 lg:p-7 flex flex-col items-center text-center"
            >
              <span className="flex-shrink-0 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-orange-red/10 border border-orange-red/40 text-orange-red font-heading font-bold text-xl flex items-center justify-center mb-4">
                {i + 1}
              </span>
              <p className="font-heading text-lg lg:text-xl font-bold text-off-white uppercase tracking-tight mb-2 leading-tight">{item.title}</p>
              <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <GiftVideo
          youtubeUrl={c.practiceYoutubeUrl}
          videoUrl={c.practiceVideoUrl}
          poster={c.practicePoster}
          videoId="movement_reset_practice"
          onStarted={() => track("movement_reset_video_started")}
          on50={() => track("movement_reset_video_50_percent")}
          onCompleted={() => track("movement_reset_video_completed")}
        />

        <div className="mt-8">
          <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight mb-4 text-center">
            {c.feedbackHeading}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleComplete}
              className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors w-full sm:w-auto"
            >
              <Check className="w-4 h-4" /> {c.completeBtn}
            </button>
            <button
              onClick={handleLater}
              className="font-body text-sm font-semibold text-white-muted hover:text-off-white transition-colors border border-dark-border rounded-full px-6 py-3 w-full sm:w-auto"
            >
              {c.laterBtn}
            </button>
          </div>

          <AnimatePresence>
            {feedback === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="mt-6 bg-orange-red/5 border border-orange-red/20 rounded-2xl px-6 py-5 text-center"
              >
                <p className="font-body text-sm text-off-white leading-relaxed">{c.completeMessage}</p>
                <a
                  href="#bridge"
                  className="inline-flex items-center gap-1.5 mt-4 font-body text-sm font-semibold text-orange-red hover:text-orange-red-hover transition-colors"
                >
                  Continue →
                </a>
              </motion.div>
            )}
            {feedback === "later" && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="mt-6 font-body text-sm text-white-muted text-center"
              >
                {c.laterMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}