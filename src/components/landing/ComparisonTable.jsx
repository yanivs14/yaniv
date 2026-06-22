import React from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const ROWS = [
  { label: "Adaptive daily programming", us: true, them: false },
  { label: "No equipment needed", us: true, them: false },
  { label: "Mobility + strength combined", us: true, them: "Sometimes" },
  { label: "Guided step-by-step coaching", us: true, them: false },
  { label: "Built for longevity & injury prevention", us: true, them: false },
  { label: "Community support & accountability", us: true, them: "Rarely" },
  { label: "Works anywhere, anytime", us: true, them: "Gym only" },
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
        className="mb-6"
      >
        <h3 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.95]">
          Built <span style={{ color: accent }}>different.</span>
        </h3>
        <p className="font-body text-sm text-white-muted mt-3">
          Not another workout app. A daily movement practice designed for real life.
        </p>
      </motion.div>

      {/* ── Desktop table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="hidden sm:block rounded-2xl overflow-hidden border border-dark-border bg-dark-surface"
      >
        <div className="grid grid-cols-[1fr_auto_auto]">
          <div className="px-4 py-3 border-b border-dark-border">
            <p className="font-body text-xs uppercase tracking-wider text-white-dim">Feature</p>
          </div>
          <div className="px-4 py-3 border-b border-l border-dark-border bg-[#0d1a1a]">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-off-white text-center flex items-center gap-1.5 justify-center whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
              The Movement
            </p>
          </div>
          <div className="px-4 py-3 border-b border-l border-dark-border">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-white-dim text-center whitespace-nowrap">Regular</p>
          </div>

          {ROWS.map((row, i) => (
            <React.Fragment key={i}>
              <div className={`px-4 py-3 border-b border-dark-border/50 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <p className="font-body text-xs text-white-muted">{row.label}</p>
              </div>
              <div className={`px-4 py-3 border-b border-l border-dark-border/50 bg-[#0d1a1a]/40 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <div className="flex items-center justify-center">
                  {row.us === true ? (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
                      <Check className="w-3 h-3" style={{ color: accent }} strokeWidth={3} />
                    </div>
                  ) : (
                    <span className="font-body text-xs text-white-muted">{row.us}</span>
                  )}
                </div>
              </div>
              <div className={`px-4 py-3 border-b border-l border-dark-border/50 ${i === ROWS.length - 1 ? "border-b-0" : ""}`}>
                <div className="flex items-center justify-center">
                  {row.them === true ? (
                    <Check className="w-4 h-4 text-white-dim" strokeWidth={2.5} />
                  ) : row.them === false ? (
                    <X className="w-4 h-4 text-white-dim" strokeWidth={2.5} />
                  ) : (
                    <span className="font-body text-xs text-white-dim">{row.them}</span>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden space-y-2.5">
        {ROWS.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="rounded-xl border border-dark-border bg-dark-surface p-3"
          >
            <p className="font-body text-sm text-off-white mb-2.5">{row.label}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1a1a] flex-1 min-w-0">
                {row.us === true ? (
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} strokeWidth={3} />
                ) : null}
                <span className="font-body text-[11px] text-white-muted truncate">The Movement</span>
                {row.us !== true && <span className="font-body text-[11px] text-white-muted ml-auto">{row.us}</span>}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-surface-2 flex-1 min-w-0">
                {row.them === true ? (
                  <Check className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                ) : row.them === false ? (
                  <X className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                ) : null}
                <span className="font-body text-[11px] text-white-dim truncate">Regular</span>
                {row.them !== true && row.them !== false && (
                  <span className="font-body text-[11px] text-white-dim ml-auto">{row.them}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}