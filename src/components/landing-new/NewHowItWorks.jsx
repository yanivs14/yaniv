import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "1",
    title: "Join the Inner Circle",
    desc: "Choose monthly or annual. After checkout you get an email invite to The Movement on Skool — click, create your account, you're in.",
  },
  {
    num: "2",
    title: "Start on the floor",
    desc: "Begin with the foundational positions. Bodyweight only. 10–15 minutes a day.",
  },
  {
    num: "3",
    title: "Build control, then load it",
    desc: "As your range becomes yours, you progress — into hanging work, bars, and harder positions — with control you can trust.",
  },
];

export default function NewHowItWorks() {
  return (
    <section className="py-12 lg:py-24 bg-dark-surface" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-16"
        >
          How it <span className="text-orange-red">works</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <div className="w-14 h-14 rounded-full border-2 border-orange-red flex items-center justify-center mb-6">
                <span className="font-heading text-lg font-bold text-orange-red">{step.num}</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">{step.title}</h3>
              <p className="font-body text-sm text-white-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}