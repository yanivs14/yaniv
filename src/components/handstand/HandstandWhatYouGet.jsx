import React from "react";
import { motion } from "framer-motion";

export default function HandstandWhatYouGet({ c }) {
  if (!c) return null;
  const items = c.items || [];
  const headline = (c.headline || "What you get").trim();
  const parts = headline.split(" ");
  const last = parts.pop();
  return (
    <section className="py-16 lg:py-28 bg-dark-bg">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight leading-[0.95] mb-12 lg:mb-16 text-center"
        >
          {parts.join(" ")} <span className="text-orange-red">{last}</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="group relative bg-gradient-to-b from-dark-surface to-dark-bg border border-dark-border rounded-3xl p-8 lg:p-10 overflow-hidden hover:border-orange-red/40 transition-colors"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-red/5 rounded-full blur-3xl group-hover:bg-orange-red/10 transition-colors" />
              <div className="relative flex flex-col h-full">
                <span className="font-heading text-6xl lg:text-7xl font-bold text-orange-red/15 leading-none mb-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-off-white leading-[1.05] uppercase tracking-tight">
                  {item}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}