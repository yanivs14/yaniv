import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function HandstandTestimonials({ c }) {
  const items = c?.items || [];
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
          
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {c?.headline}
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex flex-col"
            >
              <Quote className="w-8 h-8 text-orange-red/30 mb-3" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-orange-red text-orange-red" />
                ))}
              </div>
              <p className="font-body text-sm text-off-white/90 leading-relaxed flex-1 mb-4">"{t.quote}"</p>
              <div>
                <p className="font-body text-sm font-bold text-off-white">{t.name}</p>
                <p className="font-body text-xs text-white-dim">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}