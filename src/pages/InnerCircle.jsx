import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, ArrowRight, Users, Video, Zap, Target,
  Shield, Star, Clock, TrendingUp, MessageCircle, Award
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BookCallModal from "@/components/landing/BookCallModal";

const FEATURES = [
  {
    icon: Target,
    title: "Personalized Movement Plan",
    desc: "A plan built entirely around your body, goals, and current capacity — not a template."
  },
  {
    icon: Video,
    title: "Weekly Live Zoom Sessions",
    desc: "Face-to-face feedback, form corrections, and real-time guidance every single week."
  },
  {
    icon: Zap,
    title: "Ongoing Plan Adjustments",
    desc: "Your program evolves with you. As you progress, so does your training."
  },
  {
    icon: MessageCircle,
    title: "Direct Access & Support",
    desc: "Reach out anytime. You're not alone in this — you have a coach in your corner."
  },
  {
    icon: Shield,
    title: "Full Membership Included",
    desc: "Everything in the Monthly / Annual plan is included. The entire Movement library is yours."
  },
  {
    icon: Users,
    title: "Limited Spots Only",
    desc: "Inner Circle is capped intentionally. We only take on members we can fully commit to."
  },
];

const WHAT_YOU_GET = [
  "Everything included in the Monthly / Annual membership",
  "Personalized movement plan tailored to your body and goals",
  "Weekly live Zoom session for feedback and corrections",
  "Ongoing plan adjustments as you improve",
  "Direct support throughout your journey",
  "Limited availability — serious members only",
];

const PROCESS = [
  {
    step: "01",
    title: "Apply",
    desc: "Fill out a short form telling us about your goals and where you're at right now."
  },
  {
    step: "02",
    title: "Consultation Call",
    desc: "We hop on a private call to understand your situation and see if Inner Circle is the right fit."
  },
  {
    step: "03",
    title: "Your Plan Begins",
    desc: "We build your personalized plan and get to work. Your transformation starts here."
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function InnerCircle() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <Navbar />

        <main className="flex-1">

          {/* ── HERO ── */}
          <section className="pt-32 pb-20 px-6 lg:px-10 bg-dark-bg relative overflow-hidden">
            {/* bg glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-red/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto relative">
              <motion.p {...fadeUp(0)} className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">
                Our Highest Level of Coaching
              </motion.p>

              <motion.h1
                {...fadeUp(0.05)}
                className="font-heading text-7xl sm:text-8xl lg:text-[10rem] font-bold leading-[0.85] uppercase tracking-tight mb-8"
              >
                <span className="text-off-white">Inner</span><br />
                <span className="text-orange-red">Circle.</span>
              </motion.h1>

              <motion.p {...fadeUp(0.15)} className="font-body text-lg lg:text-xl text-white-muted leading-relaxed max-w-2xl mb-10">
                The most personal, most premium coaching experience we offer.
                A limited program for those who are ready to go all in.
              </motion.p>

              <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-8 py-4 rounded-full hover:bg-orange-red-hover transition-colors"
                >
                  Apply for Inner Circle <ArrowRight className="w-4 h-4" />
                </button>
                <p className="font-body text-xs text-white-dim">Starts with a private consultation call</p>
              </motion.div>
            </div>
          </section>

          {/* ── DIVIDER ── */}
          <div className="h-px bg-dark-border" />

          {/* ── WHAT IS IT ── */}
          <section className="py-20 px-6 lg:px-10 bg-dark-surface">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-4">What Is It</p>
                <h2 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.9] mb-6">
                  Not a program.<br />A partnership.
                </h2>
                <p className="font-body text-base text-white-muted leading-relaxed mb-5">
                  Inner Circle is not a template you follow alone. It's a highly personalized coaching relationship — where your plan, your feedback, and your support are all built specifically for you.
                </p>
                <p className="font-body text-base text-white-muted leading-relaxed">
                  This is for the person who wants more than access to videos. They want a coach invested in their progress, adjusting the plan in real time, and showing up for them every week.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Clock, label: "Weekly Live Session", value: "1:1" },
                  { icon: TrendingUp, label: "Plan Adjustments", value: "Ongoing" },
                  { icon: Award, label: "Coaching Level", value: "Elite" },
                  { icon: Star, label: "Availability", value: "Limited" },
                ].map(({ icon: Icon, label, value }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                    className="bg-dark-bg border border-dark-border rounded-2xl p-6 flex flex-col gap-2"
                  >
                    <Icon className="w-5 h-5 text-orange-red" />
                    <p className="font-heading text-2xl font-bold text-off-white">{value}</p>
                    <p className="font-body text-xs text-white-muted uppercase tracking-wide">{label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── FEATURES GRID ── */}
          <section className="py-20 px-6 lg:px-10 bg-dark-bg">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-3">What's Included</p>
                <h2 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.9]">
                  Everything you need.<br /><span className="text-orange-red">Nothing you don't.</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    className="bg-dark-surface border border-dark-border rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-red/40 transition-colors"
                  >
                    <div className="w-10 h-10 bg-orange-red/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-orange-red" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-bold text-off-white mb-1">{title}</p>
                      <p className="font-body text-sm text-white-muted leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── WHAT YOU GET CHECKLIST ── */}
          <section className="py-20 px-6 lg:px-10 bg-dark-surface">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-10"
              >
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-3">The Full Package</p>
                <h2 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.9]">
                  What you get.
                </h2>
              </motion.div>

              <div className="space-y-4">
                {WHAT_YOU_GET.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex items-start gap-4 bg-dark-bg border border-dark-border rounded-xl px-5 py-4"
                  >
                    <CheckCircle className="w-5 h-5 text-orange-red flex-shrink-0 mt-0.5" />
                    <span className="font-body text-base text-white-muted">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PROCESS ── */}
          <section className="py-20 px-6 lg:px-10 bg-dark-bg">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-3">How It Works</p>
                <h2 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.9]">
                  Three steps.<br /><span className="text-orange-red">One transformation.</span>
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-3 gap-6">
                {PROCESS.map(({ step, title, desc }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative"
                  >
                    <p className="font-heading text-7xl font-bold text-dark-border leading-none mb-4">{step}</p>
                    <p className="font-heading text-2xl font-bold uppercase text-off-white mb-2">{title}</p>
                    <p className="font-body text-sm text-white-muted leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="py-24 px-6 lg:px-10 bg-dark-surface border-t border-dark-border">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-4">Ready?</p>
                <h2 className="font-heading text-6xl sm:text-7xl font-bold uppercase tracking-tight text-off-white leading-[0.9] mb-6">
                  This is your<br /><span className="text-orange-red">move.</span>
                </h2>
                <p className="font-body text-base text-white-muted leading-relaxed mb-3 max-w-xl mx-auto">
                  Inner Circle is designed for members looking for our most personal and premium coaching experience. Spots are limited and application is required.
                </p>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-10 max-w-xl mx-auto">
                  If you prefer self-guided access to the full Movement library, please choose the Monthly or Annual membership instead.
                </p>

                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-10 py-5 rounded-full hover:bg-orange-red-hover transition-colors text-base"
                >
                  Apply for Inner Circle <ArrowRight className="w-5 h-5" />
                </button>

                <p className="font-body text-xs text-white-dim mt-5">
                  Application starts with a private consultation with our team.
                </p>
              </motion.div>
            </div>
          </section>

        </main>

        <Footer />
      </div>

      <BookCallModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}