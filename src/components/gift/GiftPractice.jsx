import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftPractice({ c, onComplete }) {
  const [feedback, setFeedback] = useState(null);

  if (!c) return null;

  const handleComplete = () => {
    if (feedback) return;
    setFeedback("complete");
    track("movement_reset_completed");
    if (onComplete) onComplete();
    setTimeout(() => {
      const el = document.getElementById("bridge");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 1000);
  };

  const handleLater = () => {
    if (feedback) return;
    setFeedback("later");
  };

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

        {/* Compact instruction row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
          {c.instructions?.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-2.5"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-red/10 border border-orange-red/40 text-orange-red font-heading font-bold text-xs flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-off-white uppercase tracking-tight mb-0.5 leading-tight">{item.title}</p>
                <p className="font-body text-xs text-white-muted leading-relaxed">{item.desc}</p>
              </div>
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

        {/* Completion feedback */}
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-5">{c.feedbackHeading}</h3>
          <AnimatePresence mode="wait">
            {feedback === null && (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <button
                  onClick={handleComplete}
                  className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors w-full sm:w-auto"
                >
                  <Check className="w-4 h-4" /> {c.completeBtn}
                </button>
                <button
                  onClick={handleLater}
                  className="font-body text-sm font-semibold text-white-muted hover:text-off-white transition-colors underline underline-offset-4"
                >
                  {c.laterBtn}
                </button>
              </motion.div>
            )}
            {feedback === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-dark-bg border border-orange-red/30 rounded-2xl p-6"
              >
                <p className="font-body text-sm text-off-white leading-relaxed">{c.completeMessage}</p>
              </motion.div>
            )}
            {feedback === "later" && (
              <motion.div
                key="later"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-dark-bg border border-dark-border rounded-2xl p-6"
              >
                <p className="font-body text-sm text-white-muted leading-relaxed">{c.laterMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}