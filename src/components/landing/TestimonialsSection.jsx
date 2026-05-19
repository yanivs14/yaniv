import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function TestimonialsSection() {
  const { content } = useSiteContent();
  const c = content.testimonials;

  return (
    <section className="py-20 lg:py-32 bg-dark-bg" id="results">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.headline1}<br />
            <span className="text-orange-red">{c.headlineAccent}</span>
          </h2>
          <p className="mt-6 font-body text-base text-white-muted max-w-lg leading-relaxed">{c.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {c.items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img src={t.img} alt={`Testimonial from ${t.name}`} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-orange-red text-orange-red" />)}
                </div>
                <p className="font-body text-sm text-off-white/80 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">{t.name}</p>
                  <p className="font-body text-xs text-white-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8 border-t border-dark-border pt-12">
          {c.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-5xl lg:text-6xl font-bold text-orange-red">{stat.value}</div>
              <p className="mt-2 font-body text-sm text-white-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}