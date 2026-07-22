import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftPostPractice({ c }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          track("gift_post_practice_viewed");
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!c) return null;
  return (
    <section id="post-practice" ref={ref} className="bg-dark-bg py-14 lg:py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4 text-center">
            {c.heading}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto mb-8 text-center">
            {c.supporting}
          </p>
          <GiftVideo
            youtubeUrl={c.closingYoutubeUrl}
            videoUrl={c.closingVideoUrl}
            poster={c.closingPoster}
            videoId="gift_post_practice"
            overlay={c.closingOverlay}
            onStarted={() => track("gift_post_practice_started")}
            onCompleted={() => track("gift_post_practice_completed")}
          />
          <div className="text-center mt-8">
            <a
              href="#membership"
              className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
            >
              {c.primaryCta} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}