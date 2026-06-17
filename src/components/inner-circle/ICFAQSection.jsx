import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import ICGallery from "@/components/inner-circle/ICGallery";

export default function ICFAQSection({ c, accent }) {
  const [openIdx, setOpenIdx] = useState(null);

  if (!c) return null;

  const gallery = c.gallery || [];

  return (
    <section className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mb-14">
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: c.eyebrowColor || "#888" }}>{c.eyebrow}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9]">
            Got<br />
            <span style={{ color: c.headlineAccentColor || accent }}>questions?</span>
          </h2>
        </motion.div>

        <div className={gallery.length > 0 ? "grid lg:grid-cols-2 gap-12 lg:gap-16 items-start" : ""}>
          {/* FAQ accordion */}
          <div className="divide-y divide-[#ddd]">
          {(c.items || []).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}>
              <button
                className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#0a0a0a] group-hover:opacity-80 transition-opacity">
                  {item.q}
                </span>
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[#ccc] transition-colors"
                  style={openIdx === i ? { backgroundColor: accent, borderColor: accent } : {}}>
                  {openIdx === i
                    ? <Minus className="w-4 h-4 text-white" />
                    : <Plus className="w-4 h-4 text-[#444]" />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden">
                    <p className="pb-6 text-sm text-[#555] leading-relaxed max-w-3xl">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          </div>

          {/* Gallery — right side, only if images exist */}
          {gallery.length > 0 && (
            <div>
              <ICGallery images={gallery} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}