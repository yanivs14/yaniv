import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function GiftHero({ c }) {
  if (!c) return null;
  return (
    <section id="top" className="bg-dark-bg pt-10 lg:pt-16 pb-10 lg:pb-14">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{c.eyebrow}</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">
            {c.headline}
          </h1>
          <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed max-w-2xl mx-auto mb-7">
            {c.supporting}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#practice" className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-all w-full sm:w-auto focus:outline-none focus:ring-4 focus:ring-orange-red/30">
              {c.primaryCta} <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#membership" className="font-body text-sm font-medium text-white-muted hover:text-off-white transition-colors underline underline-offset-4">
              {c.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}