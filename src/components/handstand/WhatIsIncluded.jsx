import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

export default function WhatIsIncluded({ c }) {
  if (!c) return null;
  const items = c.items || [];
  return (
    <section className="py-14 lg:py-20 bg-dark-surface">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {c.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95]">
            <AccentText text={c.headline} />
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-3 bg-dark-bg border border-dark-border rounded-xl p-5"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-red/10 border border-orange-red/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-orange-red" />
              </div>
              <span className="font-body text-sm text-off-white leading-relaxed pt-1">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}