import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

export default function WhatIsIncluded({ c }) {
  if (!c) return null;
  const items = c.items || [];
  return (
    <section className="py-10 lg:py-16 bg-dark-surface">
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          {c.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight leading-[1.0]">
            <AccentText text={c.headline} />
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dark-bg border border-dark-border rounded-2xl p-5 lg:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                <span className="font-body text-[15px] text-off-white leading-[1.4]">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}