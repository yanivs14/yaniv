import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

export default function GiftBridge({ c }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          track("membership_bridge_viewed");
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!c) return null;
  return (
    <section id="bridge" ref={ref} className="bg-gradient-to-b from-dark-surface to-dark-bg py-14 lg:py-20 border-y border-dark-border">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{c.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-5">
            {c.headline}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-2xl mx-auto mb-10">{c.copy}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 text-left">
            {c.benefits?.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-dark-surface border border-dark-border rounded-2xl p-5"
              >
                <p className="font-heading text-base font-bold text-off-white uppercase tracking-tight mb-1.5">{b.title}</p>
                <p className="font-body text-sm text-white-muted leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          <a
            href="#membership"
            className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c.ctaText} <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}