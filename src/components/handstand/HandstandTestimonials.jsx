import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function HandstandTestimonials({ c }) {
  const items = c?.items || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-surface relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-red/3 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
        >
          <div>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight leading-[0.95]">
              Real Students.<br />
              <span className="text-orange-red">Real Results.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-5 h-5 fill-orange-red text-orange-red" />
              ))}
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-off-white">4.9/5</p>
              <p className="font-body text-xs text-white-dim uppercase tracking-wider">from 200+ students</p>
            </div>
          </div>
        </motion.div>

        {/* Masonry-style staggered grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative bg-dark-bg border border-dark-border rounded-2xl p-6 lg:p-7 flex flex-col hover:border-orange-red/30 transition-colors duration-300 ${i === 1 ? "md:mt-8" : ""}`}
            >
              {/* Large decorative quote */}
              <Quote className="absolute top-5 right-5 w-10 h-10 text-orange-red/10 group-hover:text-orange-red/20 transition-colors" />

              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-orange-red text-orange-red" />
                ))}
              </div>

              <p className="font-body text-sm text-off-white/90 leading-relaxed flex-1 mb-6 relative z-10">"{t.quote}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-dark-border">
                {/* Avatar with initial */}
                <div className="w-10 h-10 rounded-full bg-orange-red/10 border border-orange-red/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-base font-bold text-orange-red">
                    {t.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-off-white">{t.name}</p>
                  <p className="font-body text-xs text-white-dim">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}