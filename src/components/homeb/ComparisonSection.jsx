import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function ComparisonSection() {
  const { content } = useSiteContent();
  const c = content.homebComparison || {};

  const headline = c.headline || "Everyone wants structure, a routine, and fast results. Here's who actually gives you all three.";
  const rows = c.rows || [
    { feature: "Time to start", movement: "10 min, exact exercise ready for you", youtube: "Endless searching", gym: "Drive, park, wait for equipment" },
    { feature: "Pain relief", movement: "Lasts", youtube: "Temporary, if any", gym: "Focus on aesthetics only" },
    { feature: "Who's coaching you", movement: "Roye, daily", youtube: "No one personally", gym: "Extra cost for personal trainer" },
    { feature: "Routine", movement: "Built as a daily 10 min habit", youtube: "Easy to abandon", gym: "Easy to skip" },
    { feature: "Feels different by", movement: "Week 1", youtube: "Unknown", gym: "2-3 Months" },
    { feature: "Cost", movement: "$19.99/mo", youtube: "Free (but no plan)", gym: "$50-150/mo" },
  ];
  const columns = c.columns || ["The Movement", "Random YouTube", "Traditional Gym"];

  return (
    <section className="bg-dark-bg py-12 lg:py-20" id="comparison">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight max-w-4xl mx-auto leading-tight">
            {(() => {
              const parts = headline.split(" ");
              const last = parts.pop();
              return <>{parts.join(" ")} <span className="text-orange-red">{last}</span></>;
            })()}
          </h2>
          {c.subtitle && (
            <p className="mt-5 font-body text-base lg:text-lg text-white-muted max-w-2xl mx-auto leading-relaxed">{c.subtitle}</p>
          )}
        </motion.div>

        {/* Desktop table */}
        <div className="hidden lg:block rounded-2xl overflow-hidden border border-dark-border bg-dark-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-5 font-heading text-lg font-bold text-white-muted uppercase tracking-wide w-1/4">&nbsp;</th>
                <th className="p-5 font-heading text-xl font-bold text-orange-red uppercase tracking-wide text-center w-1/4 bg-orange-red/5">{columns[0]}</th>
                <th className="p-5 font-heading text-lg font-bold text-white-muted uppercase tracking-wide text-center w-1/4">{columns[1]}</th>
                <th className="p-5 font-heading text-lg font-bold text-white-muted uppercase tracking-wide text-center w-1/4">{columns[2]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i < rows.length - 1 ? "border-b border-dark-border" : ""}>
                  <td className="p-5 font-body text-sm font-semibold text-off-white">{row.feature}</td>
                  <td className="p-5 text-center bg-orange-red/5">
                    <div className="flex flex-col items-center gap-1.5">
                      <Check className="w-4 h-4 text-orange-red flex-shrink-0" />
                      <span className="font-body text-sm text-off-white font-medium">{row.movement}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <X className="w-4 h-4 text-white-dim flex-shrink-0" />
                      <span className="font-body text-sm text-white-muted">{row.youtube}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <X className="w-4 h-4 text-white-dim flex-shrink-0" />
                      <span className="font-body text-sm text-white-muted">{row.gym}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-4">
          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-dark-border">
                <p className="font-heading text-base font-bold text-off-white uppercase tracking-wide">{row.feature}</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-orange-red/10 border border-orange-red/20">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-xs text-orange-red font-semibold uppercase tracking-wide mb-0.5">{columns[0]}</p>
                    <p className="font-body text-sm text-off-white">{row.movement}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5">
                  <X className="w-4 h-4 text-white-dim flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-xs text-white-dim font-semibold uppercase tracking-wide mb-0.5">{columns[1]}</p>
                    <p className="font-body text-sm text-white-muted">{row.youtube}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5">
                  <X className="w-4 h-4 text-white-dim flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-xs text-white-dim font-semibold uppercase tracking-wide mb-0.5">{columns[2]}</p>
                    <p className="font-body text-sm text-white-muted">{row.gym}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}