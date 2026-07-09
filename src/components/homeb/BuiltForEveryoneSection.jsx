import { motion } from "framer-motion";
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
          <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">{c.eyebrow || "Inclusivity"}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-8 lg:mb-12">
            {c.headline || "Built For Everyone"}
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
        </motion.div>
      </div>
    </section>
  );
}