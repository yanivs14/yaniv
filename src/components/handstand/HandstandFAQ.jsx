import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, HelpCircle } from "lucide-react";

export default function HandstandFAQ({ c }) {
  const items = c?.items || [];
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 lg:py-28 bg-dark-bg relative overflow-hidden">
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-red/4 rounded-full blur-[120px]" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
          {/* Left — title + contact prompt */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-orange-red" />
              <span className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold">Questions</span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95] mb-4">
              Frequently Asked<br />
              <span className="text-orange-red">Questions</span>
            </h2>
            <p className="font-body text-sm text-white-muted leading-relaxed mb-6">
              Everything you need to know before starting your handstand journey.
            </p>
            <div className="hidden lg:block">
              <p className="font-body text-xs text-white-dim">Still have questions?</p>
              <a
                href="#pricing"
                className="font-body text-sm text-orange-red font-semibold hover:text-orange-red-hover transition-colors"
              >
                Talk to us →
              </a>
            </div>
          </motion.div>

          {/* Right — accordion */}
          <div className="space-y-3">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`rounded-2xl overflow-hidden border transition-colors duration-300 ${
                    isOpen ? "bg-dark-surface border-orange-red/30" : "bg-dark-surface border-dark-border hover:border-dark-border/80"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left group"
                  >
                    <span className={`font-heading text-base lg:text-lg font-bold uppercase tracking-wide transition-colors ${
                      isOpen ? "text-orange-red" : "text-off-white group-hover:text-off-white"
                    }`}>
                      {item.q}
                    </span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen ? "bg-orange-red rotate-45" : "bg-dark-bg border border-dark-border"
                    }`}>
                      <Plus className={`w-4 h-4 transition-colors ${isOpen ? "text-dark-bg" : "text-white-muted"}`} />
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
                          <p className="font-body text-sm text-white-muted leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}