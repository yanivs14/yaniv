import React from "react";
import { motion } from "framer-motion";
import { Layers, Play, Users } from "lucide-react";

export default function NewWhatIs() {
  return (
    <section className="py-12 lg:py-24 bg-dark-surface" id="what-is">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-12 max-w-3xl"
        >
          A daily practice, a method,<br />
          and a room full of people<br />
          doing it <span className="text-orange-red">with you.</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* The Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border border-dark-border rounded-2xl p-6 lg:p-8 bg-dark-bg"
          >
            <div className="w-12 h-12 rounded-full border-2 border-orange-red flex items-center justify-center mb-5">
              <Layers className="w-5 h-5 text-orange-red" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">The Method</h3>
            <p className="font-body text-sm text-white-muted leading-relaxed">
              A complete, ground-up system for organic strength, deep mobility, and joint control. Bodyweight-based from day one — no equipment, no gym required.
            </p>
          </motion.div>

          {/* The Daily Practice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border border-dark-border rounded-2xl p-6 lg:p-8 bg-dark-bg"
          >
            <div className="w-12 h-12 rounded-full border-2 border-orange-red flex items-center justify-center mb-5">
              <Play className="w-5 h-5 text-orange-red" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">The Daily Practice</h3>
            <p className="font-body text-sm text-white-muted leading-relaxed">
              Short, guided sessions you can actually keep. 10–15 minutes is enough to start feeling the change. You follow along; you don't decode a spreadsheet of exercises.
            </p>
          </motion.div>
        </div>

        {/* The Inner Circle - full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border border-orange-red/30 rounded-2xl p-6 lg:p-8 bg-dark-bg"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full border-2 border-orange-red flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-orange-red" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight">The Inner Circle</h3>
          </div>
          <p className="font-body text-sm text-white-muted leading-relaxed mb-6">
            Roye's private community on Skool — for people who want to move better, feel stronger, and get full-body control. Inside you get:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Structured lessons that teach the why, not just the what",
              "Daily and weekly routines you can press play on",
              "Live breakdowns where Roye works through real positions and real problems",
              "A community of everyday people and athletes doing the work alongside you",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 bg-orange-red rounded-full flex-shrink-0" />
                <span className="font-body text-sm text-off-white/80">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}