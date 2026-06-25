import React from "react";
import { motion } from "framer-motion";
import { Circle, Diamond, Square, Infinity as InfinityIcon } from "lucide-react";

const pillars = [
  { icon: Circle, title: "Mobility", desc: "Open every joint. Recover the range you were born with." },
  { icon: Diamond, title: "Strength", desc: "Functional, owned. Strength your body actually uses." },
  { icon: Square, title: "Control", desc: "Precision in every transition. Move with intention." },
  { icon: InfinityIcon, title: "Longevity", desc: "Body that lasts. Decades of capability, not a sprint." },
];

export default function NewReframe() {
  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="reframe">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* LEFT — existing "Pain shows up" content */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.05] text-off-white uppercase tracking-tight mb-8"
            >
              Pain shows up when your joints<br />
              lose control of their <span className="text-orange-red">range.</span>
            </motion.h2>

            <p className="font-body text-base text-white-muted leading-relaxed mb-6">
              That's the whole thesis. Restore control of the range, and the pain has nowhere to live.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border border-dark-border rounded-2xl p-6 lg:p-8 bg-dark-surface"
            >
              <p className="font-heading text-2xl sm:text-3xl font-bold text-off-white leading-tight">
                Most programs give you exercises. <span className="text-orange-red">Roye teaches you how to move.</span>
              </p>
            </motion.div>

            <p className="mt-8 font-body text-base text-white-muted leading-relaxed">
              It's not reps and sets. It's awareness, control, and long-term resilience — built from the ground up, on the floor, against a wall, in the simple positions your training skips. You learn to use your own bodyweight as the resistance, then progress (hanging work, bars) as your control grows.
            </p>
            <p className="mt-5 font-body text-base text-white-muted leading-relaxed">
              This doesn't replace your training. It makes everything you already do work better — you move cleaner, you reduce pain, and you build control in the exact positions your lifts miss.
            </p>
          </div>

          {/* RIGHT — "Learn About Our Programs" with 2x2 grid + hanging media */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-body text-sm text-orange-red uppercase tracking-widest mb-3"
            >
              Join the Movement
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-heading text-4xl sm:text-5xl font-bold leading-[1.05] text-off-white uppercase tracking-tight mb-5"
            >
              Learn about our programs
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-body text-sm text-white-muted leading-relaxed mb-8 max-w-md"
            >
              Not just a workout. A daily practice that touches every layer of how your body operates — from joint health to nervous system regulation to the quality of your next decade.
            </motion.p>

            {/* 2x2 feature grid */}
            <div className="grid grid-cols-2 border-t border-l border-dark-border">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group relative pt-6 pb-7 px-5 border-r border-b border-dark-border overflow-hidden"
                  >
                    <div className="absolute bottom-0 left-5 right-5 h-px bg-orange-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    <div className="relative">
                      <div className="mb-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                        <Icon className="w-6 h-6 text-orange-red" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-2 group-hover:text-orange-red transition-colors duration-300">
                        {p.title}
                      </h3>
                      <p className="font-body text-xs text-white-muted leading-relaxed">{p.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Hanging media with overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface relative"
            >
              <img
                src="https://images.unsplash.com/photo-1574680096145-72261c3f45b0?w=800&q=80"
                alt="Hanging exercise practice"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
              <div className="absolute top-6 left-0 right-0 text-center">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight">
                  Hang for 30s–60s
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}