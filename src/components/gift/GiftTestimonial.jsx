import React from "react";
import { motion } from "framer-motion";

export default function GiftTestimonial({ c }) {
  if (!c) return null;
  return (
    <section className="bg-dark-bg py-10 lg:py-14">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
          {c.img ? (
            <img src={c.img} alt={c.name} className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover flex-shrink-0 border-2 border-orange-red/30" />
          ) : (
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-orange-red/10 border-2 border-orange-red/30 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-2xl font-bold text-orange-red">{(c.name || "?").charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-body text-lg lg:text-xl text-off-white leading-relaxed italic mb-3">"{c.quote}"</p>
            <p className="font-body text-sm font-semibold text-off-white">{c.name}{c.context ? <span className="font-normal text-white-muted"> — {c.context}</span> : null}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}