import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandCurriculum({ c }) {
  const stages = c?.stages || [];
  const [openStage, setOpenStage] = useState(0);

  return (
    <section className="py-10 lg:py-16 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-orange-red/[0.04] rounded-full blur-[150px]" />
      <div className="relative max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-8"
        >
          {c?.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight leading-[1.0] mb-3">
            <AccentText text={c?.headline} />
          </h2>
          <p className="font-body text-[15px] lg:text-base text-white-muted max-w-xl mx-auto leading-[1.5]">{c?.subtitle}</p>
        </motion.div>

        <div className="space-y-2.5">
          {stages.map((stage, i) => {
            const isOpen = openStage === i;
            const modules = stage.modules || [];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className={`rounded-2xl overflow-hidden border transition-colors ${isOpen ? "bg-dark-surface border-orange-red/30" : "bg-dark-surface border-dark-border"}`}
              >
                <button
                  onClick={() => setOpenStage(isOpen ? -1 : i)}
                  className="w-full flex items-center gap-4 p-4 lg:p-5 text-left"
                >
                  <div className={`flex-shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center border transition-all ${isOpen ? "bg-orange-red border-orange-red" : "bg-dark-bg border-dark-border"}`}>
                    <span className={`font-heading text-base lg:text-lg font-bold ${isOpen ? "text-dark-bg" : "text-orange-red"}`}>{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm lg:text-base font-bold text-off-white uppercase tracking-tight leading-tight">{stage.title}</h3>
                    <p className="font-body text-xs text-white-dim uppercase tracking-wide mt-0.5">{stage.weeks}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 lg:px-5 pb-4 lg:pb-5">
                        <p className="font-body text-[15px] text-white-muted leading-[1.5] mb-3 pl-12 lg:pl-14">{stage.summary}</p>
                        <div className="space-y-2 pl-12 lg:pl-14">
                          {modules.map((m, j) => (
                            <div key={j} className="border-l-2 border-dark-border pl-3">
                              <p className="font-body text-[10px] text-white-dim uppercase tracking-widest">{m.week}</p>
                              <p className="font-heading text-sm font-bold text-off-white uppercase tracking-tight leading-tight">{m.title}</p>
                              <p className="font-body text-[13px] text-white-muted leading-snug">{m.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {c?.callout && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 bg-dark-surface border border-orange-red/20 rounded-2xl p-4 lg:p-5 text-center"
          >
            <p className="font-body text-[15px] text-white-muted leading-[1.5]">{c.callout}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}