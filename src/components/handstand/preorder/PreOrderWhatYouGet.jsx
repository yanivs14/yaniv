import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ITEMS = [
  "All 4 phases — Wall hold to freestanding",
  "2 bonus libraries: Elements + Toolbox",
  "Lifetime access — no subscription",
];

export default function PreOrderWhatYouGet() {
  return (
    <section className="relative py-16 lg:py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 uppercase tracking-tight leading-[0.95]"
        >
          What You <span className="text-teal-600">Get</span>
        </motion.h2>

        <div className="mt-10 flex flex-col gap-3 max-w-md mx-auto">
          {ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-left"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/15 flex-shrink-0">
                <Check className="w-4 h-4 text-teal-600" strokeWidth={3} />
              </span>
              <span className="font-body text-sm sm:text-base text-gray-700 font-medium">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}