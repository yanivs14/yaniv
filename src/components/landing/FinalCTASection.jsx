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
      <section className="py-20 lg:py-36 bg-dark-bg relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-red/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-6">{c.eyebrow}</p>
            <h2 className="font-heading text-6xl sm:text-7xl lg:text-9xl font-bold leading-[0.88] text-off-white uppercase tracking-tight">
              {c.headline1}<br />
              {c.headline2}<br />
              <span className="text-orange-red">{c.headlineAccent}</span>
            </h2>
            <p className="mt-8 font-body text-base text-white-muted max-w-md mx-auto leading-relaxed">{c.subtitle}</p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-10 py-4 rounded-full hover:bg-orange-red-hover transition-all duration-200 shadow-lg shadow-orange-red/20 hover:shadow-orange-red/40">
                {c.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => setQuizOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4 decoration-white-dim"
              >
                {c.ctaSecondary}
              </button>
            </div>

            <p className="mt-6 font-body text-xs text-white-dim">{c.footnote}</p>

            {c.signature && (
              <p className="mt-12 font-body text-sm text-white-dim italic">{c.signature}</p>
            )}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {quizOpen && <Quiz onClose={() => setQuizOpen(false)} />}
      </AnimatePresence>
    </>
  );
}