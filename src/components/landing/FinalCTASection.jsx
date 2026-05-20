import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import Quiz from "./Quiz";

export default function FinalCTASection() {
  const { content } = useSiteContent();
  const c = content.finalCta;
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <section className="py-12 lg:py-24 bg-dark-bg">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-6">{c.eyebrow}</p>
            <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
              {c.headline1}<br />
              {c.headline2}<br />
              <span className="text-orange-red">{c.headlineAccent}</span>
            </h2>
            <p className="mt-8 font-body text-base text-white-muted max-w-md mx-auto leading-relaxed">{c.subtitle}</p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing" className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors">
                {c.ctaPrimary}
              </a>
              <button
                onClick={() => setQuizOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4 decoration-white-dim"
              >
                {c.ctaSecondary} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-5 font-body text-xs text-white-muted">{c.footnote}</p>
            <p className="mt-10 font-body text-sm text-white-dim">{c.signature}</p>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {quizOpen && <Quiz onClose={() => setQuizOpen(false)} />}
      </AnimatePresence>
    </>
  );
}