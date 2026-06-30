import React from "react";
import { motion } from "framer-motion";
import { Lock, Shuffle, TrendingDown, AlertTriangle } from "lucide-react";

const STRUGGLES = [
  {
    icon: Lock,
    title: "Stuck at the Wall",
    desc: "You can hold against the wall for minutes — but the second you step away, you collapse. The wall is a crutch, not a tool.",
  },
  {
    icon: Shuffle,
    title: "Random YouTube Chaos",
    desc: "You bounce between tutorials with no structure, no plan, no progression. Ten coaches, ten opinions, zero results.",
  },
  {
    icon: TrendingDown,
    title: "Plateaued for Months",
    desc: "Your hold time hasn't moved in weeks. You train hard, but you're not training smart — so nothing changes.",
  },
  {
    icon: AlertTriangle,
    title: "Fear of Falling",
    desc: "Every kick-up feels like a gamble. Your brain freezes your body, and fear — not strength — is what's holding you back.",
  },
];

const FALLBACK_ICONS = [Lock, Shuffle, TrendingDown, AlertTriangle];

export default function HandstandProblem({ c }) {
  const points = c?.points || [];

  // Use CMS data if available, otherwise fall back to the hardcoded struggles
  const items = points.length > 0
    ? points.map((p, i) => ({
        icon: FALLBACK_ICONS[i % FALLBACK_ICONS.length],
        title: p.title,
        desc: p.desc,
      }))
    : STRUGGLES;

  return (
    <section className="py-20 lg:py-32 bg-dark-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-red/[0.03] rounded-full blur-[150px]" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-off-white uppercase tracking-tight leading-[0.9] mb-5">
            Sound <span className="text-orange-red">familiar?</span>
          </h2>
          <p className="font-body text-base text-white-muted max-w-md mx-auto leading-relaxed">
            Most people never crack the handstand — not because they can't, but because they're stuck in the same traps.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                className="group relative bg-dark-surface border border-dark-border rounded-2xl p-4 sm:p-7 lg:p-8 hover:border-orange-red/40 transition-all duration-300 overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-red/0 to-orange-red/0 group-hover:from-orange-red/[0.04] group-hover:to-transparent transition-all duration-500" />

                <div className="relative">
                  {/* Icon */}
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-dark-surface-2 border border-dark-border flex items-center justify-center mb-3 sm:mb-5 group-hover:border-orange-red/40 group-hover:bg-orange-red/10 transition-all duration-300">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white-dim group-hover:text-orange-red transition-colors duration-300" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg sm:text-2xl lg:text-3xl font-bold text-off-white uppercase tracking-tight mb-2 sm:mb-3 group-hover:text-orange-red transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Desc */}
                  <p className="font-body text-xs sm:text-sm text-white-muted leading-relaxed">{item.desc}</p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 right-0 w-px h-8 bg-orange-red/0 group-hover:bg-orange-red/40 transition-all duration-500" />
                  <div className="absolute top-0 right-0 h-px w-8 bg-orange-red/0 group-hover:bg-orange-red/40 transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 font-heading text-xl lg:text-2xl text-white-dim uppercase tracking-wide"
        >
          The problem isn't you.{" "}
          <span className="text-off-white">It's the approach.</span>
        </motion.p>
      </div>
    </section>
  );
}