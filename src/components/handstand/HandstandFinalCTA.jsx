import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandFinalCTA({ c }) {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="py-20 lg:py-32 bg-dark-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-red/5 to-transparent" />
      <div className="relative max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-5 leading-[0.95]">
            <AccentText text={c?.headline} />
          </h2>
          <p className="font-body text-lg text-white-muted mb-8 max-w-xl mx-auto">{c?.subtitle}</p>
          <button
            onClick={scrollToPricing}
            data-cta-id="handstand_final_cta"
            className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-base font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c?.ctaText} <ArrowRight className="w-5 h-5" />
          </button>
          {c?.priceNote && (
            <p className="mt-4 font-body text-sm text-white-dim">{c.priceNote}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}