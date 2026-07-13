import React from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

const accent = "#00fff7";

const DEFAULT_ROWS = [
  { feature: "Adaptive daily programming", movement: "Yes", youtube: "No", gym: "No" },
  { feature: "No equipment needed", movement: "Yes", youtube: "Yes", gym: "No" },
  { feature: "Mobility + strength combined", movement: "Yes", youtube: "Sometimes", gym: "Sometimes" },
  { feature: "Guided step-by-step coaching", movement: "Yes", youtube: "No", gym: "Extra cost" },
  { feature: "Built for longevity & injury prevention", movement: "Yes", youtube: "No", gym: "No" },
  { feature: "Community support & accountability", movement: "Yes", youtube: "Rarely", gym: "No" },
  { feature: "Works anywhere, anytime", movement: "Yes", youtube: "Yes", gym: "Gym only" },
];

export default function ComparisonTable() {
  const { content } = useSiteContent();
  const c = content?.homebComparison || {};
  const rows = c.rows?.length ? c.rows : DEFAULT_ROWS;
  const columns = c.columns?.length ? c.columns : ["The Movement", "Random YouTube", "Traditional Gym"];

  const headline = c.headline || "Built different.";
  const headlineParts = headline.split("{accent}");
  const hasAccent = headline.includes("{accent}");

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-3">
        <h3 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-off-white leading-[0.95]">
          {hasAccent ? (
            <>
              {headlineParts[0]}<span style={{ color: accent }}>{headlineParts[1]}</span>
            </>
          ) : (
            <>Built <span style={{ color: accent }}>different.</span></>
          )}
        </h3>
      </motion.div>

      {/* ── Desktop table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="hidden sm:block rounded-2xl overflow-hidden border border-dark-border bg-dark-surface">
        
        <div className="grid grid-cols-[1fr_auto_auto]">
          <div className="px-4 py-2 border-b border-dark-border">
            <p className="font-body text-xs uppercase tracking-wider text-white-dim">Feature</p>
          </div>
          <div className="px-4 py-2 border-b border-l border-dark-border bg-[#0d1a1a]">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-off-white text-center flex items-center gap-1.5 justify-center whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
              {columns[0]}
            </p>
          </div>
          <div className="px-4 py-2 border-b border-l border-dark-border">
            <p className="font-heading text-sm font-bold uppercase tracking-tight text-white-dim text-center whitespace-nowrap">{columns[2]}</p>
          </div>

          {rows.map((row, i) => {
            const isLast = i === rows.length - 1;
            const usVal = row.movement;
            const themVal = row.gym;
            return (
              <React.Fragment key={i}>
                <div className={`px-4 py-2 border-b border-dark-border/50 ${isLast ? "border-b-0" : ""}`}>
                  <p className="font-body text-xs text-white-muted">{row.feature}</p>
                </div>
                <div className={`px-4 py-2 border-b border-l border-dark-border/50 bg-[#0d1a1a]/40 ${isLast ? "border-b-0" : ""}`}>
                  <div className="flex items-center justify-center">
                    {usVal === "Yes" || usVal === true ?
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
                        <Check className="w-3 h-3" style={{ color: accent }} strokeWidth={3} />
                      </div>
                    : usVal === "No" || usVal === false ?
                      <X className="w-4 h-4 text-white-dim" strokeWidth={2.5} />
                    :
                      <span className="font-body text-xs text-white-muted text-center max-w-[120px]">{usVal}</span>
                    }
                  </div>
                </div>
                <div className={`px-4 py-2 border-b border-l border-dark-border/50 ${isLast ? "border-b-0" : ""}`}>
                  <div className="flex items-center justify-center">
                    {themVal === "Yes" || themVal === true ?
                      <Check className="w-4 h-4 text-white-dim" strokeWidth={2.5} />
                    : themVal === "No" || themVal === false ?
                      <X className="w-4 h-4 text-white-dim" strokeWidth={2.5} />
                    :
                      <span className="font-body text-xs text-white-dim text-center max-w-[120px]">{themVal}</span>
                    }
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden space-y-2.5">
        {rows.map((row, i) => {
          const usVal = row.movement;
          const themVal = row.gym;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="rounded-xl border border-dark-border bg-dark-surface p-3">
              <p className="font-body text-sm text-off-white mb-2.5">{row.feature}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1a1a] flex-1 min-w-0">
                  {usVal === "Yes" || usVal === true ?
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} strokeWidth={3} />
                  : usVal === "No" || usVal === false ?
                    <X className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                  : null}
                  <span className="font-body text-[11px] text-white-muted truncate">{columns[0]}</span>
                  {usVal !== "Yes" && usVal !== true && usVal !== "No" && usVal !== false &&
                    <span className="font-body text-[11px] text-white-muted ml-auto">{usVal}</span>
                  }
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-surface-2 flex-1 min-w-0">
                  {themVal === "Yes" || themVal === true ?
                    <Check className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                  : themVal === "No" || themVal === false ?
                    <X className="w-3.5 h-3.5 flex-shrink-0 text-white-dim" strokeWidth={2.5} />
                  : null}
                  <span className="font-body text-[11px] text-white-dim truncate">{columns[2]}</span>
                  {themVal !== "Yes" && themVal !== true && themVal !== "No" && themVal !== false &&
                    <span className="font-body text-[11px] text-white-dim ml-auto">{themVal}</span>
                  }
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}