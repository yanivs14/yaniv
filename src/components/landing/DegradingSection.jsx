import React from "react";
import { motion } from "framer-motion";

const DEGRADE_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/b9c7805bd_generated_41015e1e.png";

const painPoints = [
  "Stiff in the morning. Tight by night.",
  "Back, hips, knees, neck — the daily friction.",
  "You move less than your body needs.",
  "Strength isn't the problem. Foundation is.",
  "Modern life is breaking your body.",
];

const stats = [
  { value: "80%", label: "of adults carry chronic joint or back pain" },
  { value: "6.5h", label: "sitting per day, on average" },
  { value: "-1%/yr", label: "muscle mass lost after 30 (untrained)" },
];

export default function DegradingSection() {
  return (
    <section className="py-20 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1] text-warm-black"
            >
              Your body has been<br />
              <em className="italic">silently degrading.</em>
            </motion.h2>
            <p className="mt-6 font-body text-base text-text-muted-warm max-w-md leading-relaxed">
              Nobody taught you to rebuild it. Until now. Stiffness. Back pain. Lost range of motion. These aren't age — they're hurting your quality of life, building up daily while you sit, scroll, and adapt to less of yourself.
            </p>

            <div className="mt-10 rounded-xl overflow-hidden aspect-[4/3]">
              <img
                src={DEGRADE_IMG}
                alt="Person stretching in dramatic lighting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right */}
          <div className="lg:pt-12">
            <ul className="space-y-5">
              {painPoints.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-2 w-1.5 h-1.5 bg-orange-red rounded-full flex-shrink-0" />
                  <span className="font-body text-base text-warm-black">{point}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-14 grid grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className="font-heading text-3xl lg:text-4xl font-bold text-orange-red">
                    {stat.value}
                  </div>
                  <p className="mt-2 font-body text-xs text-text-muted-warm leading-snug">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}