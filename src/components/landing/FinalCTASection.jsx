import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCTASection() {
  return (
    <section className="py-24 lg:py-36 bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-6">
            The only question
          </p>
          <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
            Are you ready<br />
            to actually<br />
            <span className="text-orange-red">move?</span>
          </h2>
          <p className="mt-8 font-body text-base text-white-muted max-w-md mx-auto leading-relaxed">
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
              className="inline-flex items-center justify-center gap-2 font-body text-sm text-white-muted hover:text-off-white transition-colors underline underline-offset-4 decoration-white-dim"
            >
              Take the 60-second quiz now <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="mt-5 font-body text-xs text-white-muted">
            Free · No equipment · Cancel anytime
          </p>

          <p className="mt-10 font-body text-sm text-white-dim">
            — Roye Gold
          </p>
        </motion.div>
      </div>
    </section>
  );
}