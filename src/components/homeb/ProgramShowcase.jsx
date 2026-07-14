import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Activity, ArrowRight, Check } from "lucide-react";

const SLIDES = [
  {
    num: "01",
    icon: Video,
    title: "What You Get",
    eyebrow: "The Program",
    items: [
      "240+ guided movement sessions",
      "Structured progressions, beginner to advanced",
      "Daily 10-minute practice",
      "Full library on Skool — one login",
    ],
    blob: { color: "rgba(0, 255, 247, 0.12)", x: "10%", y: "20%" },
  },
  {
    num: "02",
    icon: Activity,
    title: "How It Helps",
    eyebrow: "The Transformation",
    items: [
      "Rebuild mobility & joint health",
      "Reduce chronic back & joint pain",
      "Build functional, owned strength",
      "Move with precision & control",
    ],
    blob: { color: "rgba(0, 200, 255, 0.10)", x: "60%", y: "10%" },
  },
  {
    num: "03",
    icon: ArrowRight,
    title: "Start Today",
    eyebrow: "Your Journey",
    description: "Join thousands moving better every day. Your body is waiting.",
    cta: true,
    blob: { color: "rgba(0, 255, 247, 0.18)", x: "30%", y: "40%" },
  },
];

const SLIDE_DURATION = 5000;

export default function ProgramShowcase() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const Icon = slide.icon;

  useEffect(() => {
    const id = setInterval(() => setIndex(prev => (prev + 1) % SLIDES.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative rounded-3xl p-px bg-gradient-to-br from-orange-red/30 via-dark-border to-dark-border">
      <div className="relative bg-dark-surface rounded-3xl overflow-hidden flex flex-col min-h-[340px]">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-dark-border z-20">
          <motion.div
            key={index}
            className="h-full bg-gradient-to-r from-orange-red to-teal-400 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          />
        </div>

        {/* Animated background blob */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            <motion.div
              key={index}
              className="absolute w-72 h-72 rounded-full blur-[90px]"
              style={{ background: slide.blob.color, left: slide.blob.x, top: slide.blob.y }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </AnimatePresence>
        </div>

        {/* Large faded number */}
        <div className="absolute top-0 right-4 font-display text-[110px] font-bold text-white/[0.025] leading-none pointer-events-none select-none z-0">
          {slide.num}
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 lg:p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {/* Eyebrow + Header */}
              <div className="mb-5">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-orange-red/70 mb-2"
                >
                  {slide.eyebrow}
                </motion.p>
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-red/20 to-orange-red/5 border border-orange-red/30 flex items-center justify-center"
                  >
                    <Icon className="w-5 h-5 text-orange-red" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold text-off-white uppercase tracking-tight">{slide.title}</h3>
                </div>
              </div>

              {/* Items or CTA */}
              {slide.items ? (
                <ul className="space-y-1.5 flex-1">
                  {slide.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.09 }}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-red/10 border border-orange-red/20 group-hover:bg-orange-red/20 transition-colors flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-orange-red" strokeWidth={3} />
                      </span>
                      <span className="font-body text-sm text-white-muted group-hover:text-off-white transition-colors">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center -mt-2">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 150 }}
                    className="w-14 h-14 rounded-2xl bg-orange-red/10 border border-orange-red/30 flex items-center justify-center mb-5"
                  >
                    <Icon className="w-6 h-6 text-orange-red" />
                  </motion.div>
                  <p className="font-body text-sm text-white-muted leading-relaxed mb-6 max-w-xs">{slide.description}</p>
                  <button
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    className="group relative inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-3.5 rounded-full hover:bg-orange-red-hover transition-all"
                  >
                    <span className="absolute inset-0 bg-orange-red blur-lg opacity-50 group-hover:opacity-80 transition-opacity -z-10" />
                    Start Moving
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step indicator + Next */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-dark-border">
            <div className="flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button key={i} onClick={() => setIndex(i)} className="flex items-center gap-1.5 transition-all">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                    i === index ? "bg-orange-red text-dark-bg scale-110" : i < index ? "bg-orange-red/20 text-orange-red" : "bg-dark-border text-white-dim hover:bg-white-dim/50"
                  }`}>
                    {i < index ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIndex(prev => (prev + 1) % SLIDES.length)}
              className="font-body text-[11px] font-semibold text-white-dim hover:text-orange-red transition-colors flex items-center gap-1"
            >
              Next <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}