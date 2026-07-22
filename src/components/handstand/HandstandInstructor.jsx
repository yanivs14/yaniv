import React from "react";
import { motion } from "framer-motion";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandInstructor({ c }) {
  if (!c) return null;
  return (
    <section className="py-10 lg:py-16 bg-dark-surface">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative order-1"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-dark-bg">
              {c?.imageUrl && <img src={c.imageUrl} alt={c?.headline} className="w-full h-full object-cover" />}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2"
          >
            {c?.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight mb-5 leading-[0.95]">
              <AccentText text={c?.headline} />
            </h2>
            <p className="font-body text-[15px] lg:text-base text-white-muted leading-[1.5]">{c?.bio}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}