import React from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function PillarsSection() {
  const { content } = useSiteContent();
  const c = content.pillars;

  return (
    <section className="py-20 lg:py-32 bg-dark-bg" id="benefits">
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

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-dark-border">
          {c.pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative pt-6 pb-8 px-6 border-r border-dark-border last:border-r-0 [&:nth-child(2)]:border-r lg:[&:nth-child(2)]:border-r [&:nth-child(3)]:border-t lg:[&:nth-child(3)]:border-t-0 [&:nth-child(4)]:border-t [&:nth-child(4)]:border-r-0 lg:[&:nth-child(4)]:border-t-0 overflow-hidden cursor-default"
            >
              {/* Hover background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-red/0 to-orange-red/0 group-hover:from-orange-red/5 group-hover:to-orange-red/0 transition-all duration-500" />
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-orange-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="relative">
                <div className="text-2xl text-orange-red mb-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 inline-block">{p.icon}</div>
                <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-2 group-hover:text-orange-red transition-colors duration-300">{p.title}</h3>
                <p className="font-body text-sm text-white-muted leading-relaxed group-hover:text-off-white/70 transition-colors duration-300">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}