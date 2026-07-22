import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { track } from "@/lib/analytics";

export default function GiftProof({ c }) {
  const [openFaq, setOpenFaq] = useState(null);
  if (!c) return null;
  const testimonials = c.testimonials?.items || [];
  const faqs = c.faq?.items || [];

  const handleFaqToggle = (i) => {
    const isOpening = openFaq !== i;
    setOpenFaq(isOpening ? i : null);
    if (isOpening) track("gift_faq_opened", { question_id: `faq_${i + 1}` });
  };

  return (
    <section className="bg-dark-bg py-10 lg:py-14 border-t border-dark-border">
      {/* Additional testimonials */}
      {testimonials.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 lg:px-10 mb-12 lg:mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight text-center mb-8">{c.testimonials.heading}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex flex-col">
                <p className="font-body text-sm text-off-white leading-relaxed italic mb-4 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  {t.img ? <img src={t.img} alt={t.name} className="w-9 h-9 rounded-full object-cover" /> : <span className="w-9 h-9 rounded-full bg-orange-red/15 flex items-center justify-center text-orange-red font-heading font-bold text-sm">{(t.name || "?").charAt(0)}</span>}
                  <div>
                    <p className="font-body text-sm font-semibold text-off-white">{t.name}</p>
                    {t.context && <p className="font-body text-xs text-white-dim">{t.context}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight text-center mb-6">{c.faq.heading}</h2>
        <div className="space-y-2.5">
          {faqs.map((item, i) => (
            <div key={i} className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
              <button onClick={() => handleFaqToggle(i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
                <span className="font-body text-sm font-semibold text-off-white">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-white-muted flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="font-body text-sm text-white-muted leading-relaxed px-5 pb-4">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}