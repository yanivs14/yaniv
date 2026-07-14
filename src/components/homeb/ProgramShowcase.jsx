import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Activity, ArrowRight, Check } from "lucide-react";

const SLIDES = [
  {
    icon: Video,
    title: "What You Get",
    items: [
      "240+ guided movement sessions",
      "Structured progressions, beginner to advanced",
      "Daily 10-minute practice",
      "Full library on Skool — one login",
    ],
  },
  {
    icon: Activity,
    title: "How It Helps",
    items: [
      "Rebuild mobility & joint health",
      "Reduce chronic back & joint pain",
      "Build functional, owned strength",
      "Move with precision & control",
    ],
  },
  {
    icon: ArrowRight,
    title: "Start Today",
    description: "Join thousands moving better every day. Your body is waiting.",
    cta: true,
  },
];

const SLIDE_DURATION = 4500;

export default function ProgramShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(prev => (prev + 1) % SLIDES.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="relative bg-dark-surface border border-dark-border rounded-2xl p-6 lg:p-8 overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-dark-border">
        <motion.div
          key={index}
          className="h-full bg-orange-red origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-orange-red/10 border border-orange-red/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-orange-red" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight">{slide.title}</h3>
          </div>

          {slide.items ? (
            <ul className="space-y-3 flex-1">
              {slide.items.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-white-muted leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="font-body text-sm text-white-muted leading-relaxed mb-6">{slide.description}</p>
              <button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-6 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors w-full sm:w-auto"
              >
                Start Moving <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 mt-6">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-orange-red" : "w-1.5 bg-dark-border hover:bg-white-dim"}`}
          />
        ))}
      </div>
    </div>
  );
}