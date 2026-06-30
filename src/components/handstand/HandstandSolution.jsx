import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function HandstandSolution({ c }) {
  const benefits = c?.benefits || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-surface">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">{c?.eyebrow}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-4">
            {c?.headline}
          </h2>
          <p className="font-body text-base text-white-muted max-w-2xl mx-auto">{c?.subtitle}</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-dark-bg border border-dark-border rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-full bg-orange-red/15 flex items-center justify-center mb-4">
                <Check className="w-5 h-5 text-orange-red" />
              </div>
              <h3 className="font-heading text-lg font-bold text-off-white mb-2 uppercase">{b.title}</h3>
              <p className="font-body text-sm text-white-muted leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}