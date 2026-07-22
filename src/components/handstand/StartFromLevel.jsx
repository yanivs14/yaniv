import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

export default function StartFromLevel({ c }) {
  if (!c) return null;
  const cards = c.cards || [];
  return (
    <section className="py-14 lg:py-20 bg-dark-bg">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {c.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95] mb-3">
            <AccentText text={c.headline} />
          </h2>
          <p className="font-body text-sm lg:text-base text-white-muted max-w-xl mx-auto leading-relaxed">{c.subtitle}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-dark-surface border border-dark-border rounded-2xl p-6 lg:p-8 hover:border-orange-red/30 transition-colors"
            >
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-orange-red uppercase tracking-tight mb-5">{card.title}</h3>
              <ul className="space-y-3">
                {card.bullets?.map((b, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-white-muted leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}