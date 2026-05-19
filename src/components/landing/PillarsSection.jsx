import React from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function PillarsSection() {
  const { content } = useSiteContent();
  const c = content.pillars;

  return (
    <section className="py-20 lg:py-32 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.headline1}<br />
            {c.headline2} <span className="text-orange-red">{c.headlineAccent}</span>
          </h2>
          <p className="mt-6 font-body text-base text-white-muted max-w-xl leading-relaxed">{c.subtitle}</p>
        </motion.div>

        <div className="mt-12 rounded-2xl overflow-hidden aspect-[21/9] lg:aspect-[21/7]">
          <img src={c.imageUrl} alt="Pillars banner" className="w-full h-full object-cover" />
        </div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {c.pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="border-t border-dark-border pt-6"
            >
              <div className="text-2xl text-orange-red mb-3">{p.icon}</div>
              <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-2">{p.title}</h3>
              <p className="font-body text-sm text-white-muted leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}