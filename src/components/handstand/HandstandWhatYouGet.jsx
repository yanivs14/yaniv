import React from "react";
import { motion } from "framer-motion";
import { Layers, Library, Infinity as InfinityIcon } from "lucide-react";

const ICONS = [Layers, Library, InfinityIcon];

export default function HandstandWhatYouGet({ c }) {
  if (!c) return null;
  const items = c.items || [];
  return (
    <section className="py-16 lg:py-28 bg-dark-bg">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[0.25em] text-orange-red mb-14 lg:mb-20 text-center"
        >
          {c.headline || "What you get"}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-14">
          {items.map((item, i) => {
            const Icon = ICONS[i] || Layers;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className="flex flex-col items-center text-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-orange-red/20 blur-xl" />
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-[#0c2a28] border border-orange-red/30 flex items-center justify-center">
                    <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-orange-red" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="font-heading text-lg lg:text-2xl font-bold text-off-white leading-tight max-w-[16rem]">{item}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}