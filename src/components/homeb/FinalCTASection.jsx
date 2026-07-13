import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import Quiz from "@/components/landing/Quiz";
import { trackCtaClicked } from "@/lib/analytics";

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
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
              {c.headline1}<br />
              {c.headline2}<br />
              <span className="text-orange-red">{c.headlineAccent}</span>
            </h2>
            <p className="mt-8 font-body text-base text-white-muted max-w-md mx-auto leading-relaxed">{c.subtitle}</p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  trackCtaClicked("final_cta_scroll_pricing", "Master Your Body Today", "#pricing", window.location.pathname);
                  const el = document.getElementById("pricing");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                data-cta-id="final_cta_pricing"
                className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
              >
                Master Your Body Today
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