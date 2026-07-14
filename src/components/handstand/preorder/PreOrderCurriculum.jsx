import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

const STATS = [
  { value: "1,200+", label: "Students trained" },
  { value: "4.9/5", label: "Average rating" },
  { value: "15+ yrs", label: "Coaching handstands" },
];

const PHASES = [
  { num: "01", title: "Foundation", desc: "Bodyline, strength & stamina", points: ["Wrist prep & conditioning", "Hollow body holds", "Wall kick-up mechanics"] },
  { num: "02", title: "Balance", desc: "Enter, exit & rebalance", points: ["Chest-to-wall holds", "Toe pulls & heel pulls", "Freestanding entries"] },
  { num: "03", title: "Movement", desc: "Positions, transitions & control", points: ["Tuck, straddle & pike", "Shape transitions", "Pressing mechanics"] },
  { num: "04", title: "Specialist", desc: "Weight shifting & one-arm prep", points: ["Weight identification", "Block work & shifts", "One-arm conditioning"] },
];

function PhaseCard({ phase, isOpen, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative"
    >
      {/* Connecting line */}
      {index < PHASES.length - 1 && (
        <div className="absolute left-[2.25rem] top-full w-px h-3 bg-gradient-to-b from-orange-red/30 to-transparent z-0" />
      )}
      <div
        className={`relative z-10 flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 cursor-pointer ${
          isOpen
            ? "bg-gradient-to-r from-dark-surface to-dark-surface/50 border-orange-red/40 shadow-[0_0_30px_-12px_rgba(0,255,247,0.5)]"
            : "bg-dark-surface/40 border-dark-border hover:border-orange-red/25"
        }`}
        onClick={onToggle}
      >
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-heading text-lg font-bold flex-shrink-0 transition-colors ${
          isOpen ? "bg-orange-red text-dark-bg" : "bg-dark-bg text-orange-red/50 border border-dark-border"
        }`}>
          {phase.num}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-off-white uppercase tracking-tight leading-none">{phase.title}</h3>
          <p className="font-body text-xs text-white-muted mt-1">{phase.desc}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-orange-red flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="grid sm:grid-cols-3 gap-2 pt-3 pl-14 pr-1">
              {phase.points.map((pt, j) => (
                <li key={j} className="flex items-center gap-2 bg-dark-bg/60 border border-dark-border rounded-xl px-3 py-2.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500/15 flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" strokeWidth={3} />
                  </span>
                  <span className="font-body text-xs text-white-muted">{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PreOrderCurriculum() {
  const [open, setOpen] = useState(0);

  return (
    <>
      {/* Stats Bar */}
      <section className="relative border-y border-dark-border bg-dark-surface/30">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`text-center ${i < STATS.length - 1 ? "lg:border-r border-dark-border" : ""}`}
              >
                <div className="font-heading text-4xl lg:text-5xl font-bold text-orange-red leading-none">{s.value}</div>
                <p className="font-body text-xs text-white-muted mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phases / Roadmap */}
      <section className="relative py-16 lg:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95]">
              From your first wall hold<br />to <span className="text-orange-red">one-arm mastery</span>
            </h2>
            <p className="mt-4 font-body text-sm text-white-muted max-w-lg mx-auto leading-relaxed">
              Handstands are a skill, not a talent. Step-by-step video lessons from first kick-up to one-arm prep — taught by Roye Gold.
            </p>
          </motion.div>

          <div className="space-y-3">
            {PHASES.map((p, i) => (
              <PhaseCard
                key={p.num}
                phase={p}
                index={i}
                isOpen={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}