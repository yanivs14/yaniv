import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ValueStrip({ c }) {
  const items = c?.items || [];
  if (items.length === 0) return null;
  return (
    <section className="bg-dark-surface border-y border-dark-border py-6 lg:py-8">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              <Check className="w-4 h-4 text-orange-red flex-shrink-0" />
              <span className="font-body text-xs lg:text-sm font-semibold text-off-white leading-tight">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}