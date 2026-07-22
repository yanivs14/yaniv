import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GiftVideo from "./GiftVideo";
import { track } from "@/lib/analytics";

export default function GiftClosing({ c }) {
  if (!c) return null;
  const scrollToMembership = () => {
    document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section id="closing" className="bg-dark-bg py-10 lg:py-14">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-3">{c.headline}</h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-xl mx-auto">{c.supporting}</p>
        </motion.div>
        <div className="max-w-2xl mx-auto mb-8">
          <GiftVideo
            youtubeUrl={c.youtubeUrl}
            videoUrl={c.videoUrl}
            poster={c.poster}
            videoId="gift_closing"
            onStarted={() => track("gift_closing_video_started")}
            onCompleted={() => track("gift_closing_video_completed")}
          />
        </div>
        <div className="text-center">
          <button onClick={scrollToMembership} className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-all focus:outline-none focus:ring-4 focus:ring-orange-red/30">
            {c.ctaText} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}