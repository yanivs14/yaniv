import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function HandstandProblem({ c }) {
  const points = c?.points || [];
  return (
    <section className="py-20 lg:py-28 bg-[#f8f8f6] relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Red glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-red/5 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-red" />
            <span className="font-body text-xs text-orange-red uppercase tracking-widest font-semibold">{c?.eyebrow || "The Problem"}</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a1a] uppercase tracking-tight mb-4 leading-[0.95]">
            {c?.headline?.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-orange-red">{c?.headline?.split(" ").slice(-2).join(" ")}</span>
          </h2>
          <p className="font-body text-base text-[#888]">{c?.subtitle}</p>
        </motion.div>

        {/* Asymmetric staggered layout */}
        <div className="grid md:grid-cols-12 gap-4 lg:gap-5">
          {points.map((p, i) => {
            const layouts = [
              "md:col-span-7 md:mt-0",
              "md:col-span-5 md:mt-12",
              "md:col-span-5 md:mt-0",
              "md:col-span-7 md:mt-12",
            ];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative bg-white border border-[#e5e5e0] rounded-2xl p-6 lg:p-8 overflow-hidden hover:border-orange-red/30 hover:shadow-lg transition-all duration-300 ${layouts[i % 4]}`}
              >
                {/* Hover glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-red/0 group-hover:bg-orange-red/5 rounded-full blur-[60px] transition-all duration-500" />

                <div className="relative flex items-start gap-5">
                  {/* Large index number */}
                  <div className="flex-shrink-0">
                    <span className="font-heading text-5xl lg:text-6xl font-bold text-[#e0e0db] group-hover:text-orange-red/30 transition-colors duration-300 leading-none">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-px bg-orange-red/40" />
                      <h3 className="font-heading text-lg lg:text-xl font-bold text-[#1a1a1a] uppercase tracking-wide">{p.title}</h3>
                    </div>
                    <p className="font-body text-sm text-[#777] leading-relaxed">{p.desc}</p>
                  </div>
                </div>

                {/* Bottom accent line on hover */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-orange-red/40 transition-all duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}