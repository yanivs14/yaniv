import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BookCallModal from "@/components/landing/BookCallModal";

// Purple accent — used ONLY in this page
const P = "#982598";
const PH = "#7a1c7a"; // hover

const FEATURES = [
  {
    num: "01",
    title: "Personalized Movement Plan",
    desc: "A plan built entirely around your body, goals, and current capacity — not a template.",
  },
  {
    num: "02",
    title: "Weekly Live Zoom Feedback",
    desc: "Face-to-face feedback, form corrections, and real-time guidance every single week.",
  },
  {
    num: "03",
    title: "Ongoing Plan Adjustments",
    desc: "Your program evolves with you. As you progress, so does your training.",
  },
];

const WHAT_YOU_GET = [
  { label: "Everything included in the Monthly / Annual membership", tag: "Foundation" },
  { label: "Personalized movement plan tailored to your body, goals, and progress", tag: "Custom" },
  { label: "Weekly live Zoom feedback session", tag: "Live" },
  { label: "Ongoing plan adjustments as you improve", tag: "Adaptive" },
  { label: "Direct support throughout your journey", tag: "Support" },
  { label: "Limited availability for serious members only", tag: "Exclusive" },
];

const PROCESS = [
  {
    step: "01",
    title: "Apply",
    desc: "Fill out a short form telling us about your goals and where you're at right now.",
  },
  {
    step: "02",
    title: "Consultation Call",
    desc: "We hop on a private call to understand your situation and see if Inner Circle is the right fit.",
  },
  {
    step: "03",
    title: "Your Plan Begins",
    desc: "We build your personalized plan and get to work. Your transformation starts here.",
  },
];

const MARQUEE_ITEMS = ["The Most Personal Coaching Experience", "Limited Availability", "Personalized Plan", "Weekly Live Sessions", "Direct Support"];

export default function InnerCircle() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-body">
        <Navbar />

        <main className="flex-1">

          {/* ── HERO ── */}
          <section className="relative min-h-screen flex flex-col justify-end pt-28 pb-12 px-6 lg:px-16 overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#111] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <div className="lg:max-w-[55%]">
                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="text-xs text-[#555] uppercase tracking-[0.2em] mb-6"
                >
                  Our Highest Level of Coaching
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
                  className="font-heading text-[clamp(5rem,13vw,11rem)] font-bold leading-[0.85] uppercase tracking-tight text-off-white"
                >
                  Inner<br />
                  <span style={{ color: P }}>Circle.</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
                  className="mt-10 flex flex-col sm:flex-row items-start gap-4"
                >
                  <button
                    onClick={() => setModalOpen(true)}
                    style={{ backgroundColor: P }}
                    className="inline-flex items-center gap-2 text-white font-body text-sm font-bold px-7 py-3.5 rounded-full transition-colors hover:opacity-90"
                  >
                    Apply for Inner Circle <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <p className="font-body text-xs text-[#555] self-center">Application starts with a private consultation.</p>
                </motion.div>
              </div>

              {/* Right — keyword stack */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col items-end gap-2 lg:pb-2"
              >
                {["Personalized", "Live Feedback", "Limited Spots", "Direct Support"].map((kw, i) => (
                  <div key={kw} className="flex items-center gap-3 group">
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: P }} />
                    <span
                      className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight"
                      style={{ color: i === 0 ? "#F5F5F5" : "#2a2a2a" }}
                    >
                      {kw}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1e1e1e]" />
          </section>

          {/* ── MARQUEE ── */}
          <div className="bg-[#0f0f0f] border-b border-[#1e1e1e] py-5 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(4)].map((_, k) => (
                <span key={k} className="flex items-center">
                  {MARQUEE_ITEMS.map((t, i) => (
                    <span key={i} className="flex items-center">
                      <span className="font-heading text-sm uppercase tracking-widest text-[#888] px-8">{t}</span>
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: P }} />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* ── WHAT IS IT — light bg ── */}
          <section className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              >
                <p className="text-xs text-[#888] uppercase tracking-[0.2em] mb-6">What Is It</p>
                <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9] mb-8">
                  Not a program.<br />A partnership.
                </h2>
                <p className="text-base text-[#444] leading-relaxed mb-5">
                  Inner Circle is our most premium, highest-touch coaching experience. It includes everything in the Monthly / Annual membership, plus a personalized plan, weekly live feedback, ongoing adjustments, and direct support — offered only in limited capacity.
                </p>
                <p className="text-base text-[#666] leading-relaxed">
                  This is for the person who wants a coach invested in their progress, adjusting the plan in real time, and showing up for them every week.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-0 divide-y divide-[#ddd]"
              >
                {FEATURES.map(({ num, title, desc }) => (
                  <div key={num} className="py-7 flex gap-6 group">
                    <span className="font-heading text-sm text-[#bbb] font-bold flex-shrink-0 mt-0.5">{num}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-heading text-xl font-bold uppercase text-[#0a0a0a] tracking-tight">{title}</p>
                        <ArrowUpRight className="w-4 h-4 text-[#bbb] transition-colors flex-shrink-0 group-hover:text-[#9929EA]" />
                      </div>
                      <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── WHAT YOU GET — dark ── */}
          <section className="bg-[#0a0a0a] py-20 lg:py-28 px-6 lg:px-16 border-t border-[#1e1e1e]">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              >
                <p className="text-xs text-[#555] uppercase tracking-[0.2em] mb-6">The Full Package</p>
                <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-off-white leading-[0.9] mb-8">
                  What you<br /><span style={{ color: P }}>get.</span>
                </h2>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 border text-off-white text-sm font-semibold px-6 py-3 rounded-full transition-colors hover:opacity-90"
                  style={{ borderColor: P, color: P }}
                >
                  Apply now <ArrowUpRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Upgraded checklist */}
              <div className="space-y-3">
                {WHAT_YOU_GET.map(({ label, tag }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group flex items-center gap-4 bg-[#111] border border-[#1e1e1e] rounded-2xl px-5 py-4 hover:border-[#9929EA]/40 transition-colors"
                  >
                    {/* check circle */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${P}22` }}>
                      <Check className="w-3.5 h-3.5" style={{ color: P }} />
                    </div>
                    <span className="flex-1 text-sm text-[#c8c8c8] leading-relaxed">{label}</span>
                    <span
                      className="text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${P}18`, color: P }}
                    >
                      {tag}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PROCESS — light bg ── */}
          <section className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="mb-14"
              >
                <p className="text-xs text-[#888] uppercase tracking-[0.2em] mb-4">How It Works</p>
                <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9]">
                  Three steps.<br />One transformation.
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#ddd]">
                {PROCESS.map(({ step, title, desc }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="py-10 sm:py-0 sm:px-10 first:pl-0 last:pr-0"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-heading text-sm font-bold text-[#bbb]">{step}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#ccc]" />
                    </div>
                    <p className="font-heading text-2xl font-bold uppercase text-[#0a0a0a] tracking-tight mb-3">{title}</p>
                    <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA — dark ── */}
          <section className="bg-[#0a0a0a] py-24 lg:py-36 px-6 lg:px-16 border-t border-[#1e1e1e]">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              >
                <p className="text-xs text-[#555] uppercase tracking-[0.2em] mb-6">Ready?</p>
                <h2 className="font-heading text-6xl sm:text-7xl lg:text-[8rem] font-bold uppercase tracking-tight text-off-white leading-[0.85]">
                  This is<br />your <span style={{ color: P }}>move.</span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:max-w-sm flex flex-col gap-6"
              >
                <p className="text-sm text-white-muted leading-relaxed">
                  Inner Circle is designed for members looking for our most personal and premium coaching experience. Spots are limited and application is required.
                </p>
                <div>
                  <button
                    onClick={() => setModalOpen(true)}
                    style={{ backgroundColor: P }}
                    className="inline-flex items-center gap-2 text-white font-body text-sm font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Apply for Inner Circle <ArrowUpRight className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-[#555] mt-3">Application starts with a private consultation.</p>
                </div>
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