import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Shield, Infinity as InfinityIcon, Quote } from "lucide-react";

const TESTIMONIALS = [
  { initial: "M", name: "Maya R.", role: "Foundation → Balance", quote: "I went from barely holding a wall stand to my first freestanding handstand in weeks. The step-by-step phases finally made it click." },
  { initial: "D", name: "Daniel K.", role: "Calisthenics athlete", quote: "Roye breaks down alignment better than any coach I've worked with. Clear, no fluff, and the progressions actually build on each other." },
];

export default function PreOrderClosing({ config, onCheckout, loading }) {
  return (
    <>
      {/* Testimonials */}
      <section className="relative py-16 lg:py-24 px-6 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95]">
              Real students,<br /><span className="text-orange-red">real results</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-gradient-to-br from-dark-surface to-dark-surface/30 border border-dark-border rounded-2xl p-6 lg:p-8 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-red/5 rounded-full blur-3xl" />
                <Quote className="w-10 h-10 text-orange-red/25 mb-4" fill="currentColor" />
                <p className="relative font-body text-sm lg:text-base text-white-muted italic leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-orange-red flex items-center justify-center font-heading text-lg font-bold text-dark-bg">{t.initial}</div>
                  <div>
                    <p className="font-body text-sm font-semibold text-off-white">{t.name}</p>
                    <p className="font-body text-[11px] text-white-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 lg:py-32 px-6 border-t border-dark-border overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-red/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight leading-[0.92] mb-4"
          >
            Ready to<br /><span className="text-orange-red">go upside down?</span>
          </motion.h2>
          <p className="font-body text-base text-white-muted mb-8 max-w-md mx-auto">
            Pre-order now and save 34% before launch. Lifetime access, one-time payment.
          </p>
          <div className="flex items-baseline justify-center gap-3 mb-8">
            <span className="font-heading text-6xl lg:text-7xl font-bold text-off-white leading-none">${config.price}</span>
            <span className="font-heading text-2xl text-white-dim line-through">${config.originalPrice}</span>
            <span className="font-body text-xs font-bold text-dark-bg bg-orange-red px-3 py-1.5 rounded-full">{config.discountText}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-base font-bold px-10 py-4 rounded-2xl hover:bg-orange-red-hover transition-all disabled:opacity-60 shadow-[0_0_40px_-8px_rgba(0,255,247,0.6)] hover:shadow-[0_0_60px_-8px_rgba(0,255,247,0.9)]"
          >
            {loading ? "Loading..." : <>Pre-order now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
          </button>
          <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
            <span className="flex items-center gap-1.5 font-body text-[11px] text-white-muted"><Lock className="w-3.5 h-3.5 text-orange-red/60" /> Secure checkout</span>
            <span className="flex items-center gap-1.5 font-body text-[11px] text-white-muted"><InfinityIcon className="w-3.5 h-3.5 text-orange-red/60" /> Lifetime access</span>
            <span className="flex items-center gap-1.5 font-body text-[11px] text-white-muted"><Shield className="w-3.5 h-3.5 text-orange-red/60" /> One-time payment</span>
          </div>
        </div>
      </section>
    </>
  );
}