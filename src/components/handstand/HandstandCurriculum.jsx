import React from "react";
import { motion } from "framer-motion";
import { Check, Flag } from "lucide-react";

export default function HandstandCurriculum({ c }) {
  const modules = c?.modules || [];
  return (
    <section className="py-16 lg:py-20 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-red/5 rounded-full blur-[150px]" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-10">
        {/* Header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-10"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-3 leading-[0.95]">
            8 Weeks to Your{" "}
            <span className="text-orange-red">First Hold</span>
          </h2>
          <p className="font-body text-sm text-white-muted max-w-xl mx-auto">{c?.subtitle}</p>
        </motion.div>

        {/* Centered timeline block — number on left, content on right */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Gradient progress line — aligned to node center */}
            <div className="absolute left-5 lg:left-6 top-3 bottom-3 w-px bg-gradient-to-b from-orange-red via-orange-red/30 to-dark-border" />

            <div className="space-y-1">
              {modules.map((m, i) => {
                const isLast = i === modules.length - 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group relative flex items-center gap-4 lg:gap-5 py-2"
                  >
                    {/* Node */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        isLast
                          ? "bg-orange-red border-orange-red"
                          : "bg-dark-surface border-dark-border group-hover:border-orange-red/50 group-hover:bg-dark-surface-2"
                      }`}>
                        {isLast ? (
                          <Flag className="w-5 h-5 text-dark-bg" />
                        ) : (
                          <span className="font-heading text-lg lg:text-xl font-bold text-orange-red">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      {isLast && (
                        <div className="absolute inset-0 rounded-xl bg-orange-red/30 blur-xl" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-body text-[10px] lg:text-xs text-white-dim uppercase tracking-widest">{m.week}</p>
                        {isLast && (
                          <span className="inline-flex items-center gap-1 bg-orange-red/10 border border-orange-red/30 rounded-full px-2 py-0.5">
                            <Check className="w-2.5 h-2.5 text-orange-red" />
                            <span className="font-body text-[9px] text-orange-red font-semibold uppercase tracking-wider">Goal</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-base lg:text-lg font-bold text-off-white uppercase group-hover:text-orange-red transition-colors tracking-tight leading-tight">
                        {m.title}
                      </h3>
                      <p className="font-body text-xs lg:text-sm text-white-muted leading-snug">{m.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}