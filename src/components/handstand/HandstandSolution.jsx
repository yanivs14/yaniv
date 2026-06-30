import React from "react";
import { motion } from "framer-motion";
import { Play, ArrowUpRight } from "lucide-react";

export default function HandstandSolution({ c }) {
  const benefits = c?.benefits || [];
  return (
    <section className="py-20 lg:py-28 bg-dark-surface relative overflow-hidden">
      {/* Glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-red/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-red/3 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Video / Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-1"
          >
            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[4/5] rounded-3xl overflow-hidden border border-dark-border group cursor-pointer">
              {c?.videoUrl ? (
                <video src={c.videoUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
              ) : (
                <img
                  src={c?.imageUrl || "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80"}
                  alt="Handstand training"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-orange-red flex items-center justify-center shadow-2xl shadow-orange-red/30 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-dark-bg ml-1 fill-dark-bg" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="font-body text-xs text-off-white bg-dark-bg/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {c?.videoLabel || "Watch the method"}
                </span>
                {c?.videoDuration && (
                  <span className="font-heading text-xs font-bold text-orange-red bg-dark-bg/60 backdrop-blur-sm px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {c.videoDuration}
                  </span>
                )}
              </div>
            </div>
            {/* Floating stat card */}
            {(c?.statValue || c?.statLabel) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-5 -right-3 sm:-right-5 bg-dark-bg border border-orange-red/30 rounded-2xl p-4 shadow-xl"
              >
                {c?.statValue && <p className="font-heading text-3xl font-bold text-orange-red">{c.statValue}</p>}
                {c?.statLabel && <p className="font-body text-xs text-white-dim uppercase tracking-wider">{c.statLabel}</p>}
              </motion.div>
            )}
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2"
          >
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-5 leading-[0.95]">
              {c?.headline?.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-orange-red">{c?.headline?.split(" ").slice(-2).join(" ")}</span>
            </h2>
            <p className="font-body text-base text-white-muted mb-8 leading-relaxed max-w-lg">{c?.subtitle}</p>

            {/* Benefits */}
            <div className="space-y-1">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group flex items-start gap-4 py-4 border-b border-dark-border last:border-0 hover:border-orange-red/30 transition-colors"
                >
                  <span className="font-heading text-2xl font-bold text-white-dim group-hover:text-orange-red transition-colors w-8 flex-shrink-0">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-lg font-bold text-off-white uppercase tracking-wide">{b.title}</h3>
                      <ArrowUpRight className="w-4 h-4 text-white-dim group-hover:text-orange-red transition-colors" />
                    </div>
                    <p className="font-body text-sm text-white-muted leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}