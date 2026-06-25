import React from "react";
import { motion } from "framer-motion";

const features = [
  { icon: "◎", title: "Mobility", desc: "Open every joint. Recover the range you were born with." },
  { icon: "◈", title: "Strength", desc: "Functional, owned. Strength your body actually uses." },
  { icon: "◇", title: "Control", desc: "Precision in every transition. Move with intention." },
  { icon: "∞", title: "Longevity", desc: "Body that lasts. Decades of capability, not a sprint." },
];

const HANGING_IMAGE = "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80";

export default function NewPrograms() {
  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="reframe">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Left: Text + Features */}
          <div className="flex flex-col justify-center order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">Join The Movement</p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-5">
                Learn about our <span className="text-orange-red">programs</span>
              </h2>
              <p className="font-body text-base text-white-muted max-w-xl leading-relaxed">
                Not just a workout. A daily practice that touches every layer of how your body operates — from joint health to nervous system regulation to the quality of your next decade.
              </p>
            </motion.div>

            {/* 2x2 feature grid */}
            <div className="mt-10 grid grid-cols-2 gap-0 border-t border-dark-border">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative pt-6 pb-8 px-5 sm:px-6 border-dark-border overflow-hidden cursor-default border-r border-b [&:nth-child(2)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 [&:nth-child(4)]:border-r-0"
                >
                  <div className="absolute bottom-0 left-5 sm:left-6 right-5 sm:right-6 h-px bg-orange-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="relative">
                    <div className="text-2xl text-orange-red mb-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 inline-block">{f.icon}</div>
                    <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-2 group-hover:text-orange-red transition-colors duration-300">{f.title}</h3>
                    <p className="font-body text-sm text-white-muted leading-snug">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Media card (below on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface border border-dark-border h-full">
              <img
                src={HANGING_IMAGE}
                alt="Hanging exercise"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
              <div className="absolute top-5 left-5">
                <span className="font-heading text-xl sm:text-2xl font-bold text-off-white uppercase tracking-tight">
                  Hang for 30s–60s
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}