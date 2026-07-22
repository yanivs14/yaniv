import React from "react";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, Route } from "lucide-react";
import AccentText from "@/components/handstand/AccentText";

const ICONS = [Lock, AlertTriangle, Route];

export default function HandstandProblem({ c }) {
  const points = c?.points || [];
  return (
    <section className="py-10 lg:py-16 bg-dark-surface relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-red/[0.03] rounded-full blur-[120px]" />
      <div className="relative max-w-[1250px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {c?.eyebrow && <p className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold mb-3">{c.eyebrow}</p>}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-off-white uppercase tracking-tight leading-[1.0] mb-3 max-w-2xl mx-auto">
            <AccentText text={c?.headline} />
          </h2>
          <p className="font-body text-sm lg:text-base text-white-muted max-w-xl mx-auto leading-relaxed">{c?.subtitle}</p>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-4 lg:gap-5 max-w-4xl mx-auto">
          {points.map((p, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-dark-bg border border-dark-border rounded-2xl p-4 lg:p-6 hover:border-orange-red/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-dark-surface-2 border border-dark-border flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-orange-red" />
                </div>
                <h3 className="font-heading text-lg font-bold text-off-white uppercase tracking-tight mb-2">{p.title}</h3>
                <p className="font-body text-[15px] text-white-muted leading-[1.5]">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
        {c?.conclusion && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8 font-heading text-base lg:text-lg text-white-muted leading-relaxed max-w-2xl mx-auto"
          >
            {c.conclusion}
          </motion.p>
        )}
      </div>
    </section>
  );
}