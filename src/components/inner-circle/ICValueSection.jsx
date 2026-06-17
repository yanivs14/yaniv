import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, ArrowRight } from "lucide-react";

const changes = [
  "Move with less pain",
  "Build real strength",
  "Improve mobility",
  "Gain confidence in your body",
  "Stop guessing what to work on",
  "Create a practice you can sustain",
];

const reasons = [
  "Move better",
  "Feel stronger",
  "Get expert feedback",
  "Build consistency",
  "Understand my body",
  "Unlock movements I couldn't do before",
];

const included = [
  { title: "Personalized Assessment", desc: "Understand where you are today." },
  { title: "Personalized Program", desc: "Built around your goals and needs." },
  { title: "Weekly Live Calls", desc: "Learn directly from Roye." },
  { title: "Direct Feedback", desc: "Receive ongoing coaching and movement analysis." },
  { title: "Mid-Cycle Reassessment", desc: "Adjust and evolve the plan." },
  { title: "Private Community", desc: "Train alongside committed practitioners." },
];

const stagger = (i) => ({ initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4, delay: i * 0.06 } });

export default function ICValueSection({ accent, onApply }) {
  return (
    <>
      {/* ── HERO STATEMENT ── */}
      <section className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16 border-t border-[#e0ddd8]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <p className="text-xs uppercase tracking-[0.2em] mb-6 text-[#888]">The Inner Circle</p>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.88] mb-8">
              Move better.<br />
              Feel better.<br />
              <span style={{ color: accent }}>Know what your<br />body needs.</span>
            </h2>
            <p className="font-body text-base text-[#555] leading-relaxed mb-3">
              Our highest level of coaching for those who want personalized guidance, direct feedback, and a practice built around their body—not someone else's.
            </p>
            <p className="font-body text-sm font-semibold text-[#333] mb-8">Application only.</p>
            <p className="font-body text-base text-[#444] leading-relaxed">
              Move with less pain, more confidence, and a clearer understanding of how to train your body.
            </p>
          </motion.div>

          {/* CTA block */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}
            className="flex flex-col gap-8 lg:pl-8">

            {/* Feature cards */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Weekly calls with Roye", sub: "Face-to-face. Real feedback." },
                { label: "Personalized program", sub: "Built around your body." },
                { label: "Direct movement feedback", sub: "From Roye and The Movement team." },
              ].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                  className="flex items-start gap-4 bg-white border border-[#e8e5df] rounded-2xl px-5 py-4">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}40` }}>
                    <Check className="w-3 h-3" style={{ color: accent }} />
                  </span>
                  <div>
                    <p className="font-heading text-base font-bold uppercase tracking-tight text-[#0a0a0a]">{b.label}</p>
                    <p className="font-body text-xs text-[#888] mt-0.5">{b.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div>
              <button
                onClick={onApply}
                style={{ backgroundColor: accent }}
                className="inline-flex items-center gap-2 font-body text-sm font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a] mb-3"
              >
                Apply For The Inner Circle <ArrowUpRight className="w-4 h-4" />
              </button>
              <p className="font-body text-xs text-[#999]">Limited Capacity • Application Only</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT CHANGES ── */}
      <section className="bg-[#0a0a0a] py-20 lg:py-28 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: accent }}>Transformation</p>
            <h2 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.9] mb-10">
              What <span style={{ color: accent }}>changes?</span>
            </h2>
            <ul className="space-y-4">
              {changes.map((item, i) => (
                <motion.li key={i} {...stagger(i)} className="flex items-center gap-4">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}20`, border: `1px solid ${accent}40` }}>
                    <Check className="w-3 h-3" style={{ color: accent }} />
                  </span>
                  <span className="font-heading text-xl font-bold uppercase tracking-tight text-off-white">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}>
            <p className="text-xs uppercase tracking-[0.2em] mb-4 text-[#555]">Why People Join</p>
            <h2 className="font-heading text-5xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.9] mb-10">
              I want to <span style={{ color: accent }}>…</span>
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {reasons.map((r, i) => (
                <motion.div key={i} {...stagger(i)}
                  className="flex items-center justify-between border border-[#1e1e1e] rounded-2xl px-5 py-4 group hover:border-[#333] hover:bg-[#111] transition-all duration-200 cursor-default">
                  <span className="font-heading text-lg font-bold uppercase tracking-tight text-off-white">{r}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" style={{ color: accent }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-4 text-[#888]">Everything You Get</p>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9]">
                What's <span style={{ color: accent }}>included.</span>
              </h2>
            </div>
            <button onClick={onApply}
              className="font-heading text-lg font-bold uppercase tracking-tight text-[#0a0a0a] hover:opacity-60 transition-opacity flex items-center gap-2 flex-shrink-0 pb-1">
              Apply now <ArrowUpRight className="w-5 h-5" />
            </button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#ddd]">
            {included.map((item, i) => (
              <motion.div key={i} {...stagger(i)}
                className="bg-[#f5f4f0] p-8 hover:bg-[#eceae4] transition-colors duration-200">
                <p className="font-heading text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: accent }}>0{i + 1}</p>
                <p className="font-heading text-2xl font-bold uppercase tracking-tight text-[#0a0a0a] mb-3 leading-snug">{item.title}</p>
                <p className="font-body text-sm text-[#666] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROYE CREDIBILITY ── */}
      <section className="bg-[#0a0a0a] py-20 lg:py-24 px-6 lg:px-16 border-t border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.9] mb-8">
              <span className="text-off-white">How It</span><br />
              <span style={{ color: accent }}>Works.</span>
            </h2>
            <p className="font-body text-base text-[#888] leading-relaxed mb-4">
              For over a decade, Roye has helped thousands of people move with greater strength, mobility, control, and awareness.
            </p>
            <p className="font-body text-base text-[#ccc] leading-relaxed font-semibold">
              The Inner Circle is the closest way to work directly with him.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.1 }}
            className="flex flex-col gap-3">
            {["Apply", "Assessment", "Personalized Plan", "Weekly Guidance", "Ongoing Progress"].map((s, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-heading text-xs font-bold"
                  style={i === 0 ? { backgroundColor: accent, color: "#0a0a0a" } : { backgroundColor: "#161616", color: "#555", border: "1px solid #2a2a2a" }}>
                  {i + 1}
                </span>
                <span className={`font-heading text-xl font-bold uppercase tracking-tight ${i === 0 ? "text-off-white" : "text-[#555]"}`}>{s}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}