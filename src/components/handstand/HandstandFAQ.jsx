import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandFAQ({ c, t = {} }) {
  const { isPreLaunch } = useHandstandOffer(t);
  const items = c?.items || [];
  const [open, setOpen] = useState(0);

  return (
    <section className="py-10 lg:py-16 bg-dark-bg">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {c?.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95]">
            <AccentText text={c?.headline} />
          </h2>
        </motion.div>
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            const answer = !isPreLaunch && item.aPost ? item.aPost : item.a;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${
                  isOpen ? "bg-dark-surface border-orange-red/30" : "bg-dark-surface border-dark-border hover:border-dark-border/80"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className={`font-heading text-sm lg:text-base font-bold uppercase tracking-wide transition-colors ${isOpen ? "text-orange-red" : "text-off-white"}`}>
                    {item.q}
                  </span>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-orange-red rotate-45" : "bg-dark-bg border border-dark-border"}`}>
                    <Plus className={`w-3.5 h-3.5 transition-colors ${isOpen ? "text-dark-bg" : "text-white-muted"}`} />
                  </div>
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
                      <div className="px-5 pb-5">
                        <div className="w-8 h-px bg-orange-red/30 mb-3" />
                        <p className="font-body text-[15px] text-white-muted leading-[1.5]">{answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}