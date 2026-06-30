import React from "react";
import { motion } from "framer-motion";
import { Check, Flag } from "lucide-react";

export default function HandstandCurriculum({ c }) {
  const modules = c?.modules || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-red/5 rounded-full blur-[150px]" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-10">
        {/* Header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-off-white uppercase tracking-tight mb-4 leading-[0.95]">
            8 Weeks to Your<br />
            <span className="text-orange-red">First Hold</span>
          </h2>
          <p className="font-body text-base text-white-muted max-w-xl mx-auto">{c?.subtitle}</p>
        </motion.div>

        {/* Grid: 2 columns on desktop, 1 on mobile */}
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
          {modules.map((m, i) => {
            const isLast = i === modules.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
                className="group relative flex items-start gap-5 bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-orange-red/40 transition-all duration-300"
              >
                {/* Node */}
                <div className="relative flex-shrink-0 z-10">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    isLast
                      ? "bg-orange-red border-orange-red"
                      : "bg-dark-surface-2 border-dark-border group-hover:border-orange-red/50"
                  }`}>
                    {isLast ? (
                      <Flag className="w-5 h-5 text-dark-bg" />
                    ) : (
                      <span className="font-heading text-xl lg:text-2xl font-bold text-orange-red">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  {isLast && (
                    <div className="absolute inset-0 rounded-xl bg-orange-red/30 blur-xl" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body text-xs text-white-dim uppercase tracking-widest">{m.week}</p>
                    {isLast && (
                      <span className="inline-flex items-center gap-1 bg-orange-red/10 border border-orange-red/30 rounded-full px-2 py-0.5">
                        <Check className="w-3 h-3 text-orange-red" />
                        <span className="font-body text-[10px] text-orange-red font-semibold uppercase tracking-wider">Goal</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-lg lg:text-xl font-bold text-off-white uppercase mb-1.5 group-hover:text-orange-red transition-colors tracking-tight leading-tight">
                    {m.title}
                  </h3>
                  <p className="font-body text-sm text-white-muted leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}