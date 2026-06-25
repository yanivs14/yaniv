import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqItems = [
  {
    question: "Do I need a gym or equipment?",
    answer: "No. Everything is bodyweight-based. You learn to use your own body as resistance — from the floor, the wall, and simple positions. Later, as you progress, you can start adding bars for things like hanging work.",
  },
  {
    question: "I already train hard. Will this just be redundant?",
    answer: "No — it's the layer your training is missing. It doesn't replace your lifts; it makes them better. You'll move cleaner, reduce pain, and build control in the positions your training never touches.",
  },
  {
    question: "Can this actually help with an old injury?",
    answer: "That's why most people join. The method builds strength, mobility, and real control so you rehab the old injuries and stop creating new ones.",
  },
  {
    question: "I'm not an athlete. Is this still for me?",
    answer: "Especially for you. The Movement is for everyday people — if you sit a lot, feel stiff, or train hard but still ache, this is built for exactly that.",
  },
  {
    question: "How much time does it take?",
    answer: "10–15 minutes a day is enough to start feeling the change.",
  },
  {
    question: "What happens after I join?",
    answer: "You'll get an email invite to The Movement on Skool. Click the link, create your account if you don't have one, and you're in.",
  },
  {
    question: "How does billing work?",
    answer: "It's a monthly or annual subscription that renews at the end of your chosen period. You can cancel anytime.",
  },
];

export default function NewFaq() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="faq">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-12 text-center"
        >
          Any <span className="text-orange-red">questions?</span>
        </motion.h2>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="border border-dark-border rounded-2xl overflow-hidden bg-dark-surface"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <h3 className="font-body text-sm font-semibold text-off-white pr-4">{item.question}</h3>
                <span className="flex-shrink-0 w-7 h-7 rounded-full border border-dark-border flex items-center justify-center">
                  {open === i ? <Minus className="w-3.5 h-3.5 text-orange-red" /> : <Plus className="w-3.5 h-3.5 text-white-muted" />}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 font-body text-sm text-white-muted leading-relaxed">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}