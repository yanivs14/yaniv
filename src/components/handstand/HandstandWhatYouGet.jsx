import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function HandstandWhatYouGet({ c }) {
  if (!c) return null;
  const items = c.items || [];
  return (
    <section className="py-12 lg:py-16 bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-dark-surface to-dark-bg border-2 border-orange-red/30 rounded-2xl p-6 sm:p-8"
        >
          <p className="font-heading text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-orange-red mb-5 sm:mb-6 text-center">
            {c.headline || "What you get"}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-red/10 flex-shrink-0">
                  <Check className="w-4 h-4 text-orange-red" strokeWidth={3} />
                </span>
                <span className="font-body text-sm sm:text-base font-medium text-off-white">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}