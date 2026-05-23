import React from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function DegradingSection() {
  const { content } = useSiteContent();
  const c = content.degrading;

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="who">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <div className="px-6 lg:px-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight"
              >
                {c.headline1}<br />
                <span className="text-orange-red">{c.headlineAccent}</span>
              </motion.h2>
              <p className="mt-6 font-body text-base text-white-muted max-w-md leading-relaxed">
                {c.subtitle}
              </p>
            </div>
            <div className="mt-10 lg:px-10 overflow-hidden">
              <img src={c.imageUrl} alt="Person stretching" className="w-full h-auto block lg:rounded-xl" loading="lazy" />
            </div>
          </div>

          {/* Right */}
          <div className="lg:pt-12 px-6 lg:px-10">
            {c.listTitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-heading text-4xl sm:text-5xl font-bold text-off-white uppercase tracking-tight mb-6"
              >
                {c.listTitle}
              </motion.p>
            )}
            <ul className="space-y-5 border-t border-dark-border">
              {c.painPoints.filter(point => point?.trim()).map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3 pt-5 border-b border-dark-border pb-5"
                >
                  <span className="mt-2 w-2 h-2 bg-orange-red rounded-full flex-shrink-0" />
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight leading-tight">{point}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-14 grid grid-cols-3 gap-6">
              {c.stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}>
                  <div className="font-heading text-4xl lg:text-5xl font-bold text-orange-red">{stat.value}</div>
                  <p className="mt-2 font-body text-xs text-white-muted leading-snug">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}