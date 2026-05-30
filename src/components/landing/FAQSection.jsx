import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function FAQSection() {
  const { content } = useSiteContent();
  const items = content.faq?.items || [];
  const [open, setOpen] = useState(null);

  return (
    <section className="py-16 lg:py-28 bg-dark-bg" id="faq">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            Got <span className="text-orange-red">questions?</span>
          </h2>
          <p className="mt-4 font-body text-base text-white-muted">We've got answers.</p>
        </motion.div>

        <div className="divide-y divide-dark-border border border-dark-border rounded-2xl overflow-hidden">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200 ${open === i ? "bg-dark-surface" : "hover:bg-dark-surface/50"}`}
              >
                <span className="font-body text-sm font-semibold text-off-white pr-6 leading-relaxed">{item.question}</span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${open === i ? "bg-orange-red" : "border border-dark-border"}`}>
                  {open === i
                    ? <Minus className="w-3.5 h-3.5 text-dark-bg" />
                    : <Plus className="w-3.5 h-3.5 text-white-muted" />}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden bg-dark-surface"
                  >
                    <p className="px-6 pb-6 pt-1 font-body text-sm text-white-muted leading-relaxed border-t border-dark-border">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}