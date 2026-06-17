import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const steps = [
  { num: "01", title: "Assessment & Discovery", desc: "We start by understanding where you are today—how you move, how you train, your goals, your limitations, and the patterns that may be holding you back." },
  { num: "02", title: "Personalized Strategy", desc: "Based on your assessment, we create a personalized plan built around your body, your goals, and your current level." },
  { num: "03", title: "Begin Your Practice", desc: "Start your journey with a tailored program designed specifically for you, providing clear direction on what to focus on and how to progress." },
  { num: "04", title: "Direct Feedback & Coaching", desc: "Receive ongoing feedback from Roye and The Movement team to help refine your practice, improve your movement, and stay aligned with your goals." },
  { num: "05", title: "Ongoing Support & Adjustments", desc: "As you progress, your program evolves with you. Receive tailored adjustments, insights, and recommendations based on your development and needs." },
  { num: "06", title: "Mid-Cycle Review & Reassessment", desc: "Halfway through the program, we'll reassess your progress, identify new opportunities, and refine your plan to continue moving forward." },
  { num: "07", title: "Exclusive Access", desc: "Join a small group of committed practitioners and receive access to Roye and The Movement team through our highest level of coaching and support." },
];

export default function ICJourneySection({ accent, onApply }) {
  return (
    <section className="bg-[#0a0a0a] py-20 lg:py-28 px-6 lg:px-16 border-t border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: accent }}>Your Journey</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-off-white leading-[0.9]">
            How it <span style={{ color: accent }}>unfolds.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1e1e1e]">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-[#0a0a0a] p-8 group hover:bg-[#111] transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-heading text-xs font-bold tracking-[0.15em]" style={{ color: accent }}>{step.num}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: accent }} />
              </div>
              <p className="font-heading text-xl font-bold uppercase tracking-tight text-off-white mb-3 leading-snug">{step.title}</p>
              <p className="font-body text-sm text-[#888] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}

          {/* CTA tile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: steps.length * 0.05 }}
            className="bg-[#0a0a0a] p-8 flex flex-col justify-between"
            style={{ backgroundColor: `${accent}08` }}
          >
            <p className="font-heading text-xl font-bold uppercase tracking-tight text-off-white leading-snug mb-6">
              Ready to begin your journey?
            </p>
            <button
              onClick={onApply}
              style={{ backgroundColor: accent }}
              className="inline-flex items-center gap-2 font-body text-sm font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a] self-start"
            >
              Apply Now <ArrowUpRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}