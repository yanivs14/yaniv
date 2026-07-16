import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

function PhaseItem({ item, isOpen, onToggle, index }) {
  return (
    <div className="border-b border-dark-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 sm:gap-6 py-5 sm:py-6 text-left group"
      >
        <span className="font-heading text-2xl sm:text-3xl font-bold text-orange-red/50 group-hover:text-orange-red transition-colors flex-shrink-0 tabular-nums">
          {item.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-lg sm:text-2xl font-bold text-off-white uppercase tracking-tight leading-tight">
            {item.title}
          </p>
          <p className="font-body text-sm text-white-muted mt-0.5">{item.subtitle}</p>
        </div>
        <span className={`flex-shrink-0 w-9 h-9 rounded-full border border-dark-border flex items-center justify-center text-white-muted group-hover:border-orange-red group-hover:text-orange-red transition-colors ${isOpen ? "bg-orange-red/10 border-orange-red text-orange-red" : ""}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
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
            <div className="pb-6 pl-12 sm:pl-16 pr-4">
              <p className="font-body text-sm sm:text-base text-white-muted leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HandstandPhases({ c }) {
  const [openIndex, setOpenIndex] = useState(0);
  if (!c) return null;
  const items = c.items || [];

  const headline = c.headline || "";
  const headlineParts = headline.split(" ");
  const headlineLast = headlineParts.pop();

  return (
    <section className="py-16 lg:py-24 bg-dark-surface" id="phases">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-tight">
            {headlineParts.join(" ")} <span className="text-orange-red">{headlineLast}</span>
          </h2>
          {c.description && (
            <p className="mt-5 font-body text-base lg:text-lg text-white-muted max-w-2xl mx-auto leading-relaxed">
              {c.description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {items.map((item, i) => (
            <PhaseItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}