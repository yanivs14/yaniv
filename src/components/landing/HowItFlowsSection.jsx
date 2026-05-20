import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

function StepCard({ step }) {
  return (
    <div className="flex-shrink-0 w-72 sm:w-80 snap-start">
      <div className="w-14 h-14 rounded-full border-2 border-orange-red flex items-center justify-center mb-6">
        <span className="font-heading text-lg font-bold text-orange-red">{step.num}</span>
      </div>
      <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">{step.title}</h3>
      <p className="font-body text-sm text-white-muted leading-relaxed">{step.desc}</p>
    </div>
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
    <section className="py-20 lg:py-32 bg-dark-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-16"
        >
          {c.headline1}<br />
          <span className="text-orange-red">{c.headlineAccent}</span> {c.headline2}
        </motion.h2>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-10">
          {c.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <StepCard step={step} />
            </motion.div>
          ))}
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {c.steps.map((step, i) => (
              <StepCard key={i} step={step} />
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