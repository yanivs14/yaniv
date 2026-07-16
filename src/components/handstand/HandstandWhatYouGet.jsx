import React from "react";
import { motion } from "framer-motion";
import { Layers, Library, Infinity as InfinityIcon } from "lucide-react";

const ICONS = [Layers, Library, InfinityIcon];

export default function HandstandWhatYouGet({ c }) {
  if (!c) return null;
  const items = c.items || [];
  return (
    <section className="py-10 lg:py-14 bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-orange-red mb-8 text-center"
        >
          {c.headline || "What you get"}
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10">
          {items.map((item, i) => {
            const Icon = ICONS[i] || Layers;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-red/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-orange-red" strokeWidth={1.75} />
                </div>
                <p className="font-body text-sm lg:text-base font-medium text-off-white whitespace-nowrap">{item}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}