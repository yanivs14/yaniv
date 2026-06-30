import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HandstandHero({ c }) {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {c?.imageUrl && (
          <img src={c.imageUrl} alt="" className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/50 via-dark-bg/70 to-dark-bg" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          
          <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-off-white uppercase tracking-tight mb-6">
            {c?.headline1}<br />
            {c?.headline2} <span className="text-orange-red">{c?.headlineAccent}</span>
          </h1>
          <p className="font-body text-lg text-white-muted mb-8 max-w-xl leading-relaxed">{c?.subheadline}</p>
          <button
            onClick={scrollToPricing}
            data-cta-id="handstand_hero_cta"
            className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-base font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            {c?.ctaText} <ArrowRight className="w-5 h-5" />
          </button>
          {c?.ctaSubtext && (
            <p className="mt-4 font-body text-sm text-white-dim">{c.ctaSubtext}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}