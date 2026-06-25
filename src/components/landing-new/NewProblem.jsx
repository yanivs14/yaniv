import React from "react";
import { motion } from "framer-motion";

export default function NewProblem() {
  return (
    <section className="py-12 lg:py-24 bg-dark-surface" id="problem">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-8"
        >
          You've done everything "right"<br />
          and your body <span className="text-orange-red">still hurts.</span>
        </motion.h2>

        <div className="space-y-5 font-body text-base text-white-muted leading-relaxed">
          <p>You stretch. You foam roll. You add another gym session. The tightness comes back by morning. The old injury never fully closed. The new ones keep showing up in the same places.</p>
          <p>Here's the part nobody told you:</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 border-l-2 border-orange-red pl-6 py-2"
        >
          <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-off-white leading-tight">
            More strength on top of a body that can't control its range doesn't fix you — it loads the dysfunction. You get stronger <span className="text-orange-red">and</span> tighter. Bigger lifts, smaller range, more pain.
          </p>
        </motion.div>

        <p className="mt-8 font-body text-base text-white-muted leading-relaxed">
          Stretching pulls at the symptom. Reps and sets chase numbers. Neither one teaches your joints to actually <span className="text-off-white font-semibold">own</span> the positions they keep failing in.
        </p>
      </div>
    </section>
  );
}