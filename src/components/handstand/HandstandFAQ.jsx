import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HandstandFAQ({ c }) {
  const items = c?.items || [];
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 lg:py-28 bg-dark-bg">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {c?.headline}
          </h2>
        </motion.div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-heading text-lg font-bold text-off-white uppercase">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-orange-red flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="font-body text-sm text-white-muted leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}