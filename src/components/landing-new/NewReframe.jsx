import React from "react";
import { motion } from "framer-motion";

export default function NewReframe() {
  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="reframe">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-8"
        >
          Pain shows up when your joints<br />
          lose control of their <span className="text-orange-red">range.</span>
        </motion.h2>

        <p className="font-body text-base text-white-muted leading-relaxed mb-6">
          That's the whole thesis. Restore control of the range, and the pain has nowhere to live.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border border-dark-border rounded-2xl p-6 lg:p-8 bg-dark-surface"
        >
          <p className="font-heading text-2xl sm:text-3xl font-bold text-off-white leading-tight">
            Most programs give you exercises. <span className="text-orange-red">Roye teaches you how to move.</span>
          </p>
        </motion.div>

        <p className="mt-8 font-body text-base text-white-muted leading-relaxed">
          It's not reps and sets. It's awareness, control, and long-term resilience — built from the ground up, on the floor, against a wall, in the simple positions your training skips. You learn to use your own bodyweight as the resistance, then progress (hanging work, bars) as your control grows.
        </p>
        <p className="mt-5 font-body text-base text-white-muted leading-relaxed">
          This doesn't replace your training. It makes everything you already do work better — you move cleaner, you reduce pain, and you build control in the exact positions your lifts miss.
        </p>
      </div>
    </section>
  );
}