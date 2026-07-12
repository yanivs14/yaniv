import React from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const ROWS = [
  { label: "Time to start", us: "10 min, exact exercise ready for you", youtube: "Endless searching", gym: "Drive, park, wait for equipment" },
  { label: "Pain relief", us: "Lasts", youtube: "Temporary, if any", gym: "Focus on aesthetics only" },
  { label: "Who's coaching you", us: "Roye, daily", youtube: "No one personally", gym: "Extra cost for personal trainer" },
  { label: "Routine", us: "Built as a daily 10 min habit", youtube: "Easy to abandon", gym: "Easy to skip" },
  { label: "Feels different by", us: "Week 1", youtube: "Unknown", gym: "2-3 Months" },
  { label: "Cost", us: "$19.99/mo", youtube: "Free (but no plan)", gym: "$50-150/mo" },
];

const accent = "#00fff7";

export default function ComparisonTable() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-3">
        <h3 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.95]">
          Built <span style={{ color: accent }}>different.</span>
        </h3>
      </motion.div>

      {/* Desktop table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="hidden sm:block rounded-2xl overflow-hidden border border-dark-border bg-dark-surface">
        <div className="grid grid-cols-[1fr_auto_auto_auto]">
          {/* Header */}
          <div className="px-4 py-2 border-b border-dark-border">
            <p className="font-body text-xs uppercase tracking-wider text-white-dim">Feature</p>
          </div>
          <div className="px-4 py-2 border-b border-l border-dark-border bg-[#0d1a1a]">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-off-white text-center flex items-center gap-1.5 justify-center whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
              The Movement
            </p>
          </div>
          <div className="px-4 py-2 border-b border-l border-dark-border">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-white-dim text-center whitespace-nowrap">Random YouTube</p>
          </div>
          <div className="px-4 py-2 border-b border-l border-dark-border">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-white-dim text-center whitespace-nowrap">Traditional Gym</p>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <React.Fragment key={i}>
              <div className={`px-4 py-2 border-b border-dark-border/50 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <p className="font-body text-xs text-white-muted">{row.label}</p>
              </div>
              <div className={`px-4 py-2 border-b border-l border-dark-border/50 bg-[#0d1a1a]/40 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <div className="flex items-center gap-1.5 justify-center">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} strokeWidth={3} />
                  <span className="font-body text-xs text-off-white whitespace-nowrap">{row.us}</span>
                </div>
              </div>
              <div className={`px-4 py-2 border-b border-l border-dark-border/50 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <div className="flex items-center justify-center">
                  <span className="font-body text-xs text-white-dim whitespace-nowrap">{row.youtube}</span>
                </div>
              </div>
              <div className={`px-4 py-2 border-b border-l border-dark-border/50 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <div className="flex items-center justify-center">
                  <span className="font-body text-xs text-white-dim whitespace-nowrap">{row.gym}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        {ROWS.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="rounded-xl border border-dark-border bg-dark-surface p-3">
            <p className="font-body text-sm text-off-white mb-2.5">{row.label}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1a1a]">
                <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} strokeWidth={3} />
                <span className="font-body text-[11px] text-white-muted">The Movement</span>
                <span className="font-body text-[11px] text-off-white ml-auto text-right">{row.us}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-surface-2">
                <X className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                <span className="font-body text-[11px] text-white-dim">YouTube</span>
                <span className="font-body text-[11px] text-white-dim ml-auto text-right">{row.youtube}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-surface-2">
                <X className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                <span className="font-body text-[11px] text-white-dim">Gym</span>
                <span className="font-body text-[11px] text-white-dim ml-auto text-right">{row.gym}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}