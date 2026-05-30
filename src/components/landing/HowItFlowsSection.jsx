import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

function StepCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex-shrink-0 w-72 sm:w-auto snap-start group"
    >
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-full border border-orange-red/40 bg-orange-red/5 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-red/10 group-hover:border-orange-red transition-all duration-300">
          <span className="font-heading text-base font-bold text-orange-red">{step.num}</span>
        </div>
        <div className="pt-1 flex-1">
          <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-2 group-hover:text-orange-red transition-colors duration-300">{step.title}</h3>
          <p className="font-body text-sm text-white-muted leading-relaxed">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItFlowsSection() {
  const { content } = useSiteContent();
  const c = content.howItFlows;
  const scrollRef = useRef();

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-28 bg-dark-surface" id="program">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight"
          >
            {c.headline1}<br />
            <span className="text-orange-red">{c.headlineAccent}</span> {c.headline2}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-sm text-white-muted lg:max-w-xs leading-relaxed"
          >
            Three simple steps to get started and never look back.
          </motion.p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-0 divide-x divide-dark-border border border-dark-border rounded-2xl overflow-hidden">
          {c.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="p-8 lg:p-10 group hover:bg-dark-bg transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-full border border-orange-red/40 bg-orange-red/5 flex items-center justify-center mb-6 group-hover:bg-orange-red/10 group-hover:border-orange-red transition-all duration-300">
                <span className="font-heading text-base font-bold text-orange-red">{step.num}</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3 group-hover:text-orange-red transition-colors duration-300">{step.title}</h3>
              <p className="font-body text-sm text-white-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {c.steps.map((step, i) => (
              <div key={i} className="flex-shrink-0 w-[80vw] snap-start bg-dark-bg border border-dark-border rounded-2xl p-6">
                <div className="w-11 h-11 rounded-full border border-orange-red/40 bg-orange-red/5 flex items-center justify-center mb-5">
                  <span className="font-heading text-sm font-bold text-orange-red">{step.num}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-2">{step.title}</h3>
                <p className="font-body text-sm text-white-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-bg flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-bg flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}