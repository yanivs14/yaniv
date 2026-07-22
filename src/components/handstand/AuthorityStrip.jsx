import React from "react";
import { motion } from "framer-motion";

export default function AuthorityStrip({ c }) {
  const items = c?.items || [];
  if (items.length === 0) return null;
  return (
    <section className="bg-dark-surface border-y border-dark-border py-5 lg:py-7">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-3 gap-3 lg:gap-6 max-w-3xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-lg lg:text-2xl font-bold text-orange-red leading-tight">{item.stat}</p>
              <p className="font-body text-[13px] lg:text-sm text-white-muted leading-snug mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}