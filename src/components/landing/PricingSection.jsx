import React, { useState } from "react";
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
  const [billing, setBilling] = useState("monthly");

  return (
    <section className="py-20 lg:py-32 bg-beige-light" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm text-text-muted-warm uppercase tracking-widest mb-4">
            Begin
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1] text-warm-black">
            One method.<br />
            Pick your <em className="italic">path.</em>
          </h2>
          <p className="mt-4 font-body text-base text-text-muted-warm">
            Monthly or annual — pick what fits, switch any time.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center bg-cream-dark rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`font-body text-sm px-6 py-2.5 rounded-full transition-all ${
                billing === "monthly"
                  ? "bg-warm-black text-cream"
                  : "text-text-muted-warm hover:text-warm-black"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`font-body text-sm px-6 py-2.5 rounded-full transition-all ${
                billing === "annual"
                  ? "bg-warm-black text-cream"
                  : "text-text-muted-warm hover:text-warm-black"
              }`}
            >
              Annual
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`bg-cream border border-cream-dark rounded-2xl p-8 transition-all ${
              billing === "monthly" ? "ring-2 ring-warm-black" : "opacity-70"
            }`}
          >
            <p className="font-body text-sm text-text-muted-warm mb-1">Kinetiqo Monthly</p>
            <p className="font-body text-xs text-text-muted-warm mb-4">Monthly</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-heading text-5xl font-bold text-warm-black">$35</span>
              <span className="font-body text-sm text-text-muted-warm">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {sharedFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-warm-black">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="flex items-center justify-center gap-2 w-full bg-warm-black text-cream font-body text-sm font-semibold py-3.5 rounded-full hover:bg-warm-black/90 transition-colors"
            >
              Begin monthly <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 font-body text-xs text-text-muted-warm text-center">
              Cancel anytime
            </p>
          </motion.div>

          {/* Annual card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`bg-warm-black border border-warm-black rounded-2xl p-8 relative transition-all ${
              billing === "annual" ? "ring-2 ring-orange-red" : "opacity-70"
            }`}
          >
            <div className="absolute top-4 right-4 bg-orange-red text-white font-body text-xs font-semibold px-3 py-1 rounded-full">
              Best value
            </div>
            <p className="font-body text-sm text-cream/60 mb-1">Kinetiqo Annual</p>
            <p className="font-body text-xs text-cream/40 mb-4">Save 40% · billed yearly</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-heading text-5xl font-bold text-cream">$250</span>
              <span className="font-body text-sm text-cream/50">/ year</span>
              <span className="font-body text-sm text-cream/30 line-through">$420</span>
            </div>
            <ul className="space-y-3 mb-3">
              {sharedFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-cream/80">{f}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-orange-red font-medium">{annualExtra}</span>
              </li>
            </ul>
            <a
              href="#"
              className="flex items-center justify-center gap-2 w-full bg-orange-red text-white font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors mt-5"
            >
              Begin annual <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 font-body text-xs text-cream/40 text-center">
              Cancel anytime
            </p>
          </motion.div>
        </div>

        <p className="mt-8 text-center font-body text-sm text-text-muted-warm">
          No equipment · Cancel any time
        </p>
      </div>
    </section>
  );
}