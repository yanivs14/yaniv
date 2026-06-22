import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import ComparisonTable from "./ComparisonTable";

export default function FAQSection() {
  const { content } = useSiteContent();
  const items = content?.faq?.items || [];
  const [open, setOpen] = useState(null);
  if (!content) return null;

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="faq">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 lg:mb-12">
          
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4"></p>
          <h2 className="font-heading text-5xl sm:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            Any <span className="text-orange-red">questions?</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* FAQ items */}
          <div className="space-y-3">
            {items.map((item, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="border border-dark-border rounded-2xl overflow-hidden bg-dark-surface">
            
              <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left">
              
                <h3 className="font-body text-sm font-semibold text-off-white pr-4">{item.question}</h3>
                <span className="flex-shrink-0 w-7 h-7 rounded-full border border-dark-border flex items-center justify-center">
                  {open === i ?
                <Minus className="w-3.5 h-3.5 text-orange-red" /> :
                <Plus className="w-3.5 h-3.5 text-white-muted" />}
                </span>
              </button>
              <AnimatePresence>
                {open === i &&
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden">
                
                    <p className="px-6 pb-5 font-body text-sm text-white-muted leading-relaxed">{item.answer}</p>
                  </motion.div>
              }
              </AnimatePresence>
            </motion.div>
            )}
          </div>

          {/* Comparison table */}
          <ComparisonTable />
        </div>
      </div>
    </section>);

}