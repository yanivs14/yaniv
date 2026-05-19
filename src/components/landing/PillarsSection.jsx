import React from "react";
import { motion } from "framer-motion";

const PILLARS_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/b92a57523_generated_5445101a.png";

const pillars = [
  { icon: "◎", title: "Mobility", desc: "Open every joint. Recover the range you were born with." },
  { icon: "◈", title: "Strength", desc: "Functional, owned. Strength your body actually uses." },
  { icon: "◇", title: "Control", desc: "Precision in every transition. Move with intention." },
  { icon: "∞", title: "Longevity", desc: "Body that lasts. Decades of capability, not a sprint." },
];

export default function PillarsSection() {
  return (
    <section className="py-20 lg:py-32 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">
            The Method
          </p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            Four pillars,<br />
            one <span className="text-orange-red">operating system.</span>
          </h2>
          <p className="mt-6 font-body text-base text-white-muted max-w-xl leading-relaxed">
            Not a workout split. A daily practice that touches every layer of how your body operates — from joint health to nervous system regulation to the quality of your next decade.
          </p>
        </motion.div>

        <div className="mt-12 rounded-2xl overflow-hidden aspect-[21/9] lg:aspect-[21/7]">
          <img
            src={PILLARS_IMG}
            alt="Person doing flowing movement at golden hour"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="border-t border-dark-border pt-6"
            >
              <div className="text-2xl text-orange-red mb-3">{p.icon}</div>
              <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-2">
                {p.title}
              </h3>
              <p className="font-body text-sm text-white-muted leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}