import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BookCallModal from "@/components/landing/BookCallModal";

const WHAT_YOU_GET = [
  "Everything included in the Monthly / Annual membership",
  "Personalized movement plan tailored to your body, goals, and progress",
  "Weekly live Zoom session for feedback, corrections, and guidance",
  "Ongoing plan adjustments as you improve",
  "Direct support throughout your journey",
  "Limited availability for serious members only",
];

export default function InnerCircle() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <Navbar />

        <main className="flex-1 pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-10">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-body text-sm text-orange-red uppercase tracking-widest mb-4"
            >
              Our Highest Level of Coaching
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] uppercase tracking-tight mb-8"
            >
              <span className="text-off-white">Inner </span>
              <span className="text-orange-red">Circle.</span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="origin-left h-px bg-dark-border mb-10"
            />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-5 mb-12"
            >
              <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed">
                The Inner Circle is our most premium and highest-priced plan.
              </p>
              <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed">
                Unlike our other programs, this is a highly personalized coaching experience tailored to the individual — with a custom plan, weekly live feedback, ongoing adjustments, and a level of access offered only in small capacity.
              </p>
              <p className="font-body text-base lg:text-lg text-white-muted leading-relaxed">
                It includes everything in the Monthly / Annual membership, plus closer support to help you progress with more precision and structure.
              </p>
            </motion.div>

            {/* What You Get */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-dark-surface border border-dark-border rounded-2xl p-8 mb-10"
            >
              <p className="font-body text-xs font-bold text-off-white uppercase tracking-widest mb-6">
                What You Get
              </p>
              <ul className="space-y-4">
                {WHAT_YOU_GET.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm lg:text-base text-white-muted">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="border-t border-dark-border pt-10"
            >
              <p className="font-body text-sm text-off-white leading-relaxed mb-2">
                Inner Circle is designed for members looking for our most personal and premium coaching experience.
              </p>
              <p className="font-body text-sm text-white-muted leading-relaxed mb-7">
                If you prefer self-guided access to the full Movement library, please choose the Monthly or Annual membership.
              </p>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
              >
                Apply for Inner Circle <ArrowRight className="w-4 h-4" />
              </button>

              <p className="font-body text-xs text-white-dim mt-4">
                Application starts with a private consultation with our team.
              </p>
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>

      <BookCallModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}