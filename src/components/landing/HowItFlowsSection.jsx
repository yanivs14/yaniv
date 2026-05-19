import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Sign up",
    desc: "Get instant access to the full library of movement content by Roye Gold — every session, every progression.",
  },
  {
    num: "02",
    title: "Open Skool",
    desc: "Jump into the community classroom where the library lives. One login, everything in one place.",
  },
  {
    num: "03",
    title: "Start training",
    desc: "Choose any session that fits your day. Roye guides every cue — live coaching, conscious breath, with progressions from beginner to advanced.",
  },
];

export default function HowItFlowsSection() {
  return (
    <section className="py-20 lg:py-32 bg-dark-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-16"
        >
          How your day with<br />
          <span className="text-orange-red">movement</span> flows.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="relative"
            >
              <div className="w-14 h-14 rounded-full border-2 border-orange-red flex items-center justify-center mb-6">
                <span className="font-heading text-lg font-bold text-orange-red">{step.num}</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">
                {step.title}
              </h3>
              <p className="font-body text-sm text-white-muted leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}