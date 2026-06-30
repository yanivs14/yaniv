import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function HandstandProblem({ c }) {
  const points = c?.points || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-4">
            {c?.headline}
          </h2>
          <p className="font-body text-base text-white-muted">{c?.subtitle}</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-4">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-off-white mb-1 uppercase">{p.title}</h3>
                <p className="font-body text-sm text-white-muted leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}