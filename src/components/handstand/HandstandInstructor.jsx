import React from "react";
import { motion } from "framer-motion";
import AccentText from "@/components/handstand/AccentText";

export default function HandstandInstructor({ c }) {
  return (
    <section className="py-20 lg:py-28 bg-dark-surface">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-dark-bg">
              {c?.imageUrl && <img src={c.imageUrl} alt={c?.name} className="w-full h-full object-cover" />}
            </div>
            {c?.title && (
              <div className="absolute -bottom-4 -right-4 bg-orange-red text-dark-bg px-6 py-3 rounded-2xl">
                <p className="font-heading text-sm font-bold uppercase">{c.title}</p>
              </div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight mb-6">
              <AccentText text={c?.name} />
            </h2>
            <p className="font-body text-base text-white-muted leading-relaxed mb-8">{c?.bio}</p>
            <div className="flex gap-8">
              <div>
                <p className="font-heading text-3xl font-bold text-orange-red">10+</p>
                <p className="font-body text-xs text-white-dim uppercase">Years Teaching</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-orange-red">5K+</p>
                <p className="font-body text-xs text-white-dim uppercase">Students Coached</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-orange-red">240+</p>
                <p className="font-body text-xs text-white-dim uppercase">Training Sessions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}