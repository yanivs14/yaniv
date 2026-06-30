import React from "react";
import { motion } from "framer-motion";

export default function HandstandCurriculum({ c }) {
  const modules = c?.modules || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm text-white-dim uppercase tracking-widest mb-4">{c?.eyebrow}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-4">
            {c?.headline}
          </h2>
          <p className="font-body text-base text-white-muted max-w-2xl mx-auto">{c?.subtitle}</p>
        </motion.div>
        <div className="space-y-3">
          {modules.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-5 bg-dark-surface border border-dark-border rounded-2xl p-5 hover:border-orange-red/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-orange-red/10 border border-orange-red/20 flex items-center justify-center flex-shrink-0">
                <span className="font-heading text-lg font-bold text-orange-red">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-body text-xs text-white-dim uppercase tracking-wider mb-1">{m.week}</p>
                <h3 className="font-heading text-lg font-bold text-off-white uppercase mb-1">{m.title}</h3>
                <p className="font-body text-sm text-white-muted">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}