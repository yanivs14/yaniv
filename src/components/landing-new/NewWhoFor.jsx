import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function NewWhoFor() {
  const forYou = [
    "You sit a lot and feel stiff, locked up, or older than you are",
    "You train hard but still ache — and the ache keeps coming back",
    `You've got an old injury that technically "healed" but never feels right`,
    "You want a complete end-to-end system, not another folder of random exercises",
  ];

  const notForYou = [
    `You want a quick fix, a gimmick, or a 7-day "miracle"`,
    "You're not willing to give it 10–15 honest minutes a day",
  ];

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="who">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-12 text-center"
        >
          Who <span className="text-orange-red">it's for</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* For you */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border border-orange-red/30 rounded-2xl p-6 lg:p-8 bg-dark-surface"
          >
            <h3 className="font-heading text-xl font-bold text-orange-red uppercase tracking-tight mb-5">This is for you if:</h3>
            <ul className="space-y-4">
              {forYou.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not for you */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border border-dark-border rounded-2xl p-6 lg:p-8 bg-dark-surface"
          >
            <h3 className="font-heading text-xl font-bold text-white-muted uppercase tracking-tight mb-5">It's not for you if:</h3>
            <ul className="space-y-4">
              {notForYou.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-white-dim flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">
          No gimmicks. No quick fixes. Just the work that actually changes how your body moves.
        </p>
      </div>
    </section>
  );
}