import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function BuiltForEveryoneSection() {
  const { content } = useSiteContent();
  const c = content.homebBuiltForEveryone || {};

  const paragraphs = c.paragraphs || [
    "Sit for hours a day? Hips locked, back tight the second you stand? Stretching apps, random YouTube, even physio and massages – they treat the symptom, not the cause.",
    "This isn't one program for one type of body. Active or just getting moving again, any age, any size, any pace – built around you, not a generic plan.",
    "Fifteen years of Roye's method, broken down step by step – so anyone can follow from day one.",
  ];

  return (
    <section className="bg-dark-bg py-12 lg:py-24" id="built-for-everyone">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-8 lg:mb-12">
            {(() => {
              const h = c.headline || "Built For Everyone";
              const parts = h.split(" ");
              const last = parts.pop();
              return <>{parts.join(" ")} <span className="text-orange-red">{last}</span></>;
            })()}
          </h2>
          <div className="space-y-6">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="font-body text-base lg:text-lg text-white-muted leading-relaxed"
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Checkmark badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {["All Ages", "Any Pace", "Any Size", "Any Level"].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-dark-surface border border-dark-border rounded-full px-4 py-2">
                <Check className="w-4 h-4 text-orange-red flex-shrink-0" />
                <span className="font-body text-sm text-off-white">{badge}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}