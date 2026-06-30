import React from "react";
import { motion } from "framer-motion";
import { Check, Flag } from "lucide-react";

export default function HandstandCurriculum({ c }) {
  const modules = c?.modules || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-red/5 rounded-full blur-[150px]" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-10">
        {/* Header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-off-white uppercase tracking-tight mb-4 leading-[0.95]">
            8 Weeks to Your<br />
            <span className="text-orange-red">First Hold</span>
          </h2>
          <p className="font-body text-base text-white-muted max-w-xl mx-auto">{c?.subtitle}</p>
        </motion.div>

        {/* Centered timeline */}
        <div className="relative">
          {/* Gradient progress line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-orange-red via-orange-red/30 to-dark-border" />

          <div className="space-y-3">
            {modules.map((m, i) => {
              const isLast = i === modules.length - 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Node */}
                  <div className="relative flex-shrink-0 z-10 mb-4">
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                      isLast
                        ? "bg-orange-red border-orange-red"
                        : "bg-dark-surface border-dark-border group-hover:border-orange-red/50 group-hover:bg-dark-surface-2"
                    }`}>
                      {isLast ? (
                        <Flag className="w-6 h-6 text-dark-bg" />
                      ) : (
                        <span className="font-heading text-2xl lg:text-3xl font-bold text-orange-red">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    {isLast && (
                      <div className="absolute inset-0 rounded-2xl bg-orange-red/30 blur-xl" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6">
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <p className="font-body text-xs text-white-dim uppercase tracking-widest">{m.week}</p>
                      {isLast && (
                        <span className="inline-flex items-center gap-1 bg-orange-red/10 border border-orange-red/30 rounded-full px-2.5 py-0.5">
                          <Check className="w-3 h-3 text-orange-red" />
                          <span className="font-body text-[10px] text-orange-red font-semibold uppercase tracking-wider">Goal</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-off-white uppercase mb-2 group-hover:text-orange-red transition-colors tracking-tight">
                      {m.title}
                    </h3>
                    <p className="font-body text-sm text-white-muted leading-relaxed max-w-sm mx-auto">{m.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}