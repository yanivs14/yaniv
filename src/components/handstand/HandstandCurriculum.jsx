import React from "react";
import { motion } from "framer-motion";
import { Check, Flag } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandCurriculum({ c }) {
  const modules = c?.modules || [];
  return (
    <section className="py-14 lg:py-20 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-orange-red/[0.04] rounded-full blur-[150px]" />
      <div className="relative max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-10"
        >
          {c?.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95] mb-3">
            <AccentText text={c?.headline} />
          </h2>
          <p className="font-body text-sm lg:text-base text-white-muted max-w-xl mx-auto leading-relaxed">{c?.subtitle}</p>
        </motion.div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
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
                    <div className="relative flex-shrink-0 z-10">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        isLast ? "bg-orange-red border-orange-red" : "bg-dark-surface border-dark-border group-hover:border-orange-red/50"
                      }`}>
                        {isLast ? <Flag className="w-5 h-5 text-dark-bg" /> : <span className="font-heading text-lg lg:text-xl font-bold text-orange-red">{i + 1}</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-[10px] lg:text-xs text-white-dim uppercase tracking-widest mb-0.5">{m.week}</p>
                      <h3 className="font-heading text-base lg:text-lg font-bold text-off-white uppercase group-hover:text-orange-red transition-colors tracking-tight leading-tight">{m.title}</h3>
                      <p className="font-body text-xs lg:text-sm text-white-muted leading-snug">{m.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        {c?.callout && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-dark-surface border border-orange-red/20 rounded-2xl p-5 text-center"
          >
            <p className="font-body text-sm text-white-muted leading-relaxed">{c.callout}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}