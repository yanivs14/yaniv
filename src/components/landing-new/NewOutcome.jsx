import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const outcomes = [
  "Pain that fades because the dysfunction underneath it is gone",
  "Strength you can actually use — through full range, not just your comfortable middle",
  "Old injuries that finally close instead of flaring",
  "A body that feels younger, looser, and genuinely under your command",
  "Training that carries over, because the foundation finally holds",
];

export default function NewOutcome() {
  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="outcome">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-10"
        >
          What changes when your joints<br />
          run the show <span className="text-orange-red">again.</span>
        </motion.h2>

        <ul className="space-y-4 mb-10">
          {outcomes.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3 border-b border-dark-border pb-4"
            >
              <Check className="w-5 h-5 text-orange-red flex-shrink-0 mt-0.5" />
              <span className="font-heading text-xl sm:text-2xl font-bold text-off-white uppercase tracking-tight leading-tight">{item}</span>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-body text-base text-white-muted leading-relaxed"
        >
          This is what "longevity" actually means: a body that still moves freely in 20 years because you built control today.
        </motion.p>
      </div>
    </section>
  );
}