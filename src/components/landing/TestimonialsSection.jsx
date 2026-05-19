import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const ANNA_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/67195c632_generated_154b4cca.png";
const ANTHONY_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a9c1046f2_generated_ebce92fe.png";
const CARY_IMG = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/5371bf27f_generated_9d9e1948.png";

const testimonials = [
  { name: "Anna", role: "The Movement member", quote: "Anything is achievable at any age and with no experience.", img: ANNA_IMG },
  { name: "Anthony", role: "The Movement member", quote: "I'm walking straighter, I've gotten taller. I feel more upright.", img: ANTHONY_IMG },
  { name: "Cary", role: "The Movement member", quote: "My body is back in order from the injury that I sustained.", img: CARY_IMG },
];

const socialStats = [
  { value: "1M+", label: "in Roye's community" },
  { value: "94%", label: "feel a shift in week one" },
  { value: "4.9", label: "avg rating · App Store" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-dark-bg" id="results">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">
            What changes
          </p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            They didn't expect<br />
            <span className="text-orange-red">this.</span>
          </h2>
          <p className="mt-6 font-body text-base text-white-muted max-w-lg leading-relaxed">
            Real members. Their words, on camera — around day 21, the change is visible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img src={t.img} alt={`Testimonial from ${t.name}`} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-orange-red text-orange-red" />
                  ))}
                </div>
                <p className="font-body text-sm text-off-white/80 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">{t.name}</p>
                  <p className="font-body text-xs text-white-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8 border-t border-dark-border pt-12">
          {socialStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-5xl lg:text-6xl font-bold text-orange-red">{stat.value}</div>
              <p className="mt-2 font-body text-sm text-white-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}