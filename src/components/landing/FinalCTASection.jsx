import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="py-24 lg:py-36 bg-cream">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm text-text-muted-warm uppercase tracking-widest mb-6">
            The only question
          </p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-warm-black">
            Are you ready<br />
            to actually<br />
            <em className="italic text-orange-red">move?</em>
          </h2>
          <p className="mt-8 font-body text-base text-text-muted-warm max-w-md mx-auto leading-relaxed">
            Ten minutes. Tomorrow morning. Start the practice that gives your body back to you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-orange-red text-white font-body text-sm font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
            >
              Start moving
            </a>
            <a
              href="#method"
              className="inline-flex items-center justify-center gap-2 font-body text-sm text-warm-black underline underline-offset-4 decoration-text-muted-warm/40 hover:decoration-warm-black transition-colors"
            >
              Take the 60-second quiz now <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="mt-5 font-body text-xs text-text-muted-warm">
            Free · No equipment · Cancel anytime
          </p>

          <p className="mt-10 font-body text-sm text-text-muted-warm italic">
            — Roye Gold
          </p>
        </motion.div>
      </div>
    </section>
  );
}