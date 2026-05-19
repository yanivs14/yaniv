import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const sharedFeatures = [
  "The full Kinetiqo OS — daily adaptive practice",
  "All 240+ guided sessions with Roye",
  "Mobility, control, strength, longevity tracks",
  "Streak system + identity check-ins",
  "Live monthly sessions with Roye",
];

const annualExtra = "Unlocked: Advanced flows + restoration protocols";

export default function PricingSection() {
  return (
    <section className="py-20 lg:py-32 bg-dark-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">Begin</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            One method.<br />
            Pick your <span className="text-orange-red">path.</span>
          </h2>
          <p className="mt-4 font-body text-base text-white-muted">
            Monthly or annual — pick what fits, switch any time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-dark-bg border border-dark-border rounded-2xl p-8"
          >
            <p className="font-body text-sm text-white-muted mb-1">Kinetiqo Monthly</p>
            <div className="flex items-baseline gap-1 my-5">
              <span className="font-heading text-6xl font-bold text-off-white">$35</span>
              <span className="font-body text-sm text-white-muted">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {sharedFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-off-white/80">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="flex items-center justify-center gap-2 w-full bg-off-white text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors"
            >
              Begin monthly <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 font-body text-xs text-white-muted text-center">Cancel anytime</p>
          </motion.div>

          {/* Annual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-orange-red border border-orange-red rounded-2xl p-8 relative"
          >
            <div className="absolute top-4 right-4 bg-dark-bg/20 text-dark-bg font-body text-xs font-semibold px-3 py-1 rounded-full">
              Best value
            </div>
            <p className="font-body text-sm text-dark-bg/70 mb-1">Kinetiqo Annual</p>
            <div className="flex items-baseline gap-2 my-5">
              <span className="font-heading text-6xl font-bold text-dark-bg">$250</span>
              <span className="font-body text-sm text-dark-bg/60">/ year</span>
              <span className="font-body text-sm text-dark-bg/40 line-through">$420</span>
            </div>
            <p className="font-body text-xs text-dark-bg/70 mb-4">Save 40% · billed yearly</p>
            <ul className="space-y-3 mb-5">
              {sharedFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-dark-bg/90">{f}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-dark-bg flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-dark-bg font-semibold">{annualExtra}</span>
              </li>
            </ul>
            <a
              href="#"
              className="flex items-center justify-center gap-2 w-full bg-dark-bg text-off-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-dark-surface transition-colors"
            >
              Begin annual <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 font-body text-xs text-dark-bg/60 text-center">Cancel anytime</p>
          </motion.div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-white-muted">
          No equipment · Cancel any time
        </p>
      </div>
    </section>
  );
}