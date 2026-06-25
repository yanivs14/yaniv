import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Quiz from "@/components/landing/Quiz";

export default function NewFinalCTA() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <section className="py-12 lg:py-24 bg-dark-surface">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.9] text-off-white uppercase tracking-tight">
              Your body is waiting<br />
              for you to take the <span className="text-orange-red">wheel.</span>
            </h2>
            <p className="mt-8 font-body text-base text-white-muted max-w-md mx-auto leading-relaxed">
              Stop chasing more hours. Start building control. 10–15 minutes a day, bodyweight only, starting now.
            </p>

            <div className="mt-10">
              <button
                onClick={() => setQuizOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
              >
                Join the movement
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-8 font-body text-sm text-white-dim">No gimmicks. No quick fixes. Just the work that lasts.</p>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {quizOpen && <Quiz onClose={() => setQuizOpen(false)} />}
      </AnimatePresence>
    </>
  );
}