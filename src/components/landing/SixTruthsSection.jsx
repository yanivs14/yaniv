import React from "react";
import { motion } from "framer-motion";

const truths = [
  "Most programs add load on top of broken movement patterns.",
  "Your pain is a movement problem before it becomes a medical one.",
  "Motivation fades. Systems carry you.",
  "You don't need more intensity. You need better foundations.",
  "Longevity starts with movement quality.",
  "Strength without mobility is compensation in disguise.",
];

export default function SixTruthsSection() {
  return (
    <section className="py-20 lg:py-32 bg-beige-light" id="method">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-body text-sm text-text-muted-warm uppercase tracking-widest mb-4">
            What we believe
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1] text-warm-black">
            Six truths most<br />
            programs <em className="italic">miss.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {truths.map((truth, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex gap-5 items-start"
            >
              <span className="font-heading text-lg font-bold text-orange-red flex-shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-body text-base lg:text-lg text-warm-black leading-relaxed">
                {truth}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}