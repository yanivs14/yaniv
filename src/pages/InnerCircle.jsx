import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const stagger = (delay = 0) => ({ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } } });
import {
  FileText, Phone, Repeat, ArrowUpRight,
  Star, Zap, Video, RefreshCw, MessageCircle,
  Lock, Target, Dumbbell, Heart, Brain, Shield, Trophy,
  Flame, Clock, Users, CheckCircle, Sparkles } from
"lucide-react";
import ICNavbar from "@/components/inner-circle/ICNavbar";
import Footer from "@/components/landing/Footer";
import BookCallModal from "@/components/landing/BookCallModal";
import { loadICContent } from "@/lib/innerCircleContent";
import WhatYouGetSlider from "@/components/inner-circle/WhatYouGetSlider";
import ICFAQSection from "@/components/inner-circle/ICFAQSection";
import ICMediaBlock from "@/components/inner-circle/ICMediaBlock";
import ICGallery from "@/components/inner-circle/ICGallery";
import ICJourneySection from "@/components/inner-circle/ICJourneySection";
import ICValueSection from "@/components/inner-circle/ICValueSection";

const TAG_ICONS = {
  Foundation: Star, Custom: Target, Live: Video, Adaptive: RefreshCw,
  Support: MessageCircle, Exclusive: Lock, Strength: Dumbbell, Health: Heart,
  Mindset: Brain, Safety: Shield, Results: Trophy, Energy: Flame,
  Schedule: Clock, Community: Users, Verified: CheckCircle, Premium: Sparkles, Power: Zap
};

function getTagIcon(tag) {
  if (!tag) return CheckCircle;
  if (TAG_ICONS[tag]) return TAG_ICONS[tag];
  const lower = tag.toLowerCase();
  for (const [k, Icon] of Object.entries(TAG_ICONS)) {
    if (lower.includes(k.toLowerCase())) return Icon;
  }
  return CheckCircle;
}

function BentoCard({ item, accent, index, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`relative rounded-3xl p-7 flex flex-col justify-between cursor-default group transition-all duration-300 overflow-hidden ${className}`}
      style={{ backgroundColor: "#0a0a0a", border: `1px solid ${accent}33` }}
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}>
      <p className="relative font-heading text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-tight text-white">
        {item.label}
      </p>
      <p className="relative font-heading text-xs font-bold uppercase tracking-widest mt-4"
        style={{ color: accent }}>
        {item.tag}
      </p>
    </motion.div>);
}

export default function InnerCircle() {
  const [modalOpen, setModalOpen] = useState(false);
  const [c, setC] = useState(null);

  useEffect(() => {
    loadICContent().then(setC);
  }, []);

  if (!c) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#FF2DF1] border-t-transparent rounded-full animate-spin" />
    </div>);


  const P = c.accentColor || "#FF2DF1";

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-body">
        <ICNavbar
          links={c.navbar?.links || []}
          cta={c.navbar?.ctaText || "Apply for Inner Circle"}
          accentColor={P}
          onCtaClick={() => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'book_call_click', location: 'ic_navbar' });
            setModalOpen(true);
          }}
        />

        <main className="flex-1">

          {/* ── HERO ── */}
          <section className="relative min-h-screen flex flex-col justify-end pt-16 pb-12 px-6 lg:px-16 overflow-hidden bg-[#0a0a0a]">
            {c.hero.mediaUrl && c.hero.mediaType === "image" &&
            <>
                <img src={c.hero.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ objectPosition: "center center" }} />
                <div className="absolute inset-0 bg-[#0a0a0a]/50 pointer-events-none" />
              </>
            }
            {c.hero.mediaUrl && c.hero.mediaType === "video" &&
            <>
                <video src={c.hero.mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-[#0a0a0a]/60 pointer-events-none" />
              </>
            }
            {!c.hero.mediaUrl &&
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#111] pointer-events-none" />
            }

            <div className="relative max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <div className="lg:max-w-[55%] mt-auto">
                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="text-xs uppercase tracking-[0.2em] mb-6 text-white text-left">
                  
                  {c.hero.eyebrow}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
                  className="font-heading text-[clamp(5rem,13vw,11rem)] font-bold leading-[0.85] uppercase tracking-tight text-off-white">
                  
                  {c.hero.title1}<br />
                  <span style={{ color: P }}>{c.hero.title2}</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
                  className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                  
                  <button
                    onClick={() => {
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push({ event: 'book_call_click', location: 'ic_hero' });
                      setModalOpen(true);
                    }}
                    style={{ backgroundColor: P }}
                    className="inline-flex items-center gap-2 font-body text-sm font-bold px-7 py-3.5 rounded-full transition-colors hover:opacity-90 bg-[#000000] text-[#000000]">
                    
                    {c.hero.ctaText} <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <p className="font-body text-xs text-[#ffffff99] self-center text-left">{c.hero.ctaSubtext}</p>
                </motion.div>
              </div>

              {/* Right — keyword stack (desktop only) */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:flex flex-col items-end gap-2 lg:pb-2">
                
                {(c.hero.keywords || []).map((kw, i) =>
                <motion.div
                  key={kw}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 group">
                   <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: P }} />
                   <span
                    className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight"
                    style={{ color: "#F5F5F5" }}>
                     {kw}
                   </span>
                 </motion.div>
                )}
              </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1e1e1e]" />
          </section>

          {/* ── JOURNEY STEPS ── */}
          <ICJourneySection accent={P} onApply={() => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'book_call_click', location: 'ic_journey' });
            setModalOpen(true);
          }} />

          {/* ── WHAT IS IT ── */}
          <section id="ic-what" className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                variants={fadeLeft} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-6" style={{ color: c.whatIsIt.eyebrowColor || "#888" }}>{c.whatIsIt.eyebrow}</p>
                <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9] mb-8">
                  Not a program.<br />
                  A <span style={{ color: c.whatIsIt.headlineAccentColor || P }}>partnership</span><span style={{ color: c.whatIsIt.headlineAccentColor || P }}>.</span>
                </h2>
                <p className="text-base text-[#444] leading-relaxed mb-5">{c.whatIsIt.body1}</p>
                <p className="text-base text-[#666] leading-relaxed">{c.whatIsIt.body2}</p>
              </motion.div>

              <div className="space-y-0 divide-y divide-[#ddd]">
                {(c.whatIsIt.features || []).map(({ num, title, desc }, i) =>
                <motion.div
                  key={num}
                  variants={stagger(i * 0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
                  className="py-7 flex gap-6 group">
                    <span className="font-heading text-sm text-[#bbb] font-bold flex-shrink-0 mt-0.5">{num}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-heading text-xl font-bold uppercase text-[#0a0a0a] tracking-tight">{title}</p>
                        {i === 0 && <FileText className="w-4 h-4 flex-shrink-0 group-hover:opacity-60 transition-opacity" style={{ color: P }} />}
                        {i === 1 && <Phone className="w-4 h-4 flex-shrink-0 group-hover:opacity-60 transition-opacity" style={{ color: P }} />}
                        {i === 2 && <Repeat className="w-4 h-4 flex-shrink-0 group-hover:opacity-60 transition-opacity" style={{ color: P }} />}
                        {i > 2 && <ArrowUpRight className="w-4 h-4 flex-shrink-0 group-hover:opacity-60 transition-opacity" style={{ color: P }} />}
                      </div>
                      <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* ── WHAT IS IT MEDIA ── */}
          {c.whatIsIt.mediaUrl && c.whatIsIt.mediaType !== "none" && (
            <div className="bg-[#f5f4f0]">
              <ICMediaBlock mediaUrl={c.whatIsIt.mediaUrl} mediaType={c.whatIsIt.mediaType} accent={P} />
            </div>
          )}

          {/* ── WHAT YOU GET ── */}
          <section id="ic-benefits" className="relative bg-[#f5f4f0] py-20 lg:py-28 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-6 lg:px-16 mb-10">
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
                className="flex items-end justify-between gap-6">
                <div>
                  <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9]">
                    {c.whatYouGet.headline}
                  </h2>
                  <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.9]" style={{ color: P }}>
                    {c.whatYouGet.headlineAccent || c.whatYouGet.eyebrow}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ event: 'book_call_click', location: 'ic_what_you_get' });
                    setModalOpen(true);
                  }}
                  className="flex-shrink-0 inline-flex items-center gap-2 text-[#0a0a0a] font-heading text-lg font-bold hover:opacity-60 transition-opacity pb-2">
                  {c.whatYouGet.ctaText} <ArrowUpRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>

            {/* Mobile: horizontal slider */}
            <div className="relative lg:hidden">
              <WhatYouGetSlider items={c.whatYouGet.items || []} accent={P} />
            </div>

            {/* Desktop: Bento Grid */}
            <div className="relative hidden lg:block max-w-7xl mx-auto px-16">
              {(() => {
                const items = c.whatYouGet.items || [];
                // Row 1: item[0] light-border, item[1] dark, item[2] accent
                // Row 2: item[3] accent tall, item[4] light-border, item[5] accent, item[6] light-border
                // Row1 bgs: light(border), dark, accent | Row2 bgs: accent, light, accent, light
                const row1bgs = ["light", "dark", "accent"];
                const row2bgs = ["accent", "light", "accent", "light"];
                const row1 = items.slice(0, 3);
                const row2 = items.slice(3, 7);
                return (
                  <div className="flex flex-col gap-4">
                    {/* Row 1: 3 unequal cols */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr 2fr" }}>
                      {row1.map((item, i) =>
                      <BentoCard key={i} item={item} accent={P} index={i} className="min-h-[220px]" />
                      )}
                    </div>
                    {/* Row 2: 4 equal cols */}
                    {row2.length > 0 &&
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${row2.length}, 1fr)` }}>
                        {row2.map((item, i) =>
                      <BentoCard key={i + 3} item={item} accent={P} index={i + 3} className="min-h-[200px]" />
                      )}
                      </div>
                    }
                  </div>);

              })()}
            </div>
          </section>

          {/* ── VALUE / INCLUDED / CREDIBILITY ── */}
          <ICValueSection accent={P} onApply={() => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'book_call_click', location: 'ic_value_section' });
            setModalOpen(true);
          }} valueMedia={c.valueSection} />

          {/* ── PROCESS ── */}
          <section id="ic-process" className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16">
            <div className="max-w-7xl mx-auto">
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
                className="mb-14">
                
                <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: c.process.eyebrowColor || "#888" }}>{c.process.eyebrow}</p>
                <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.9]">
                  Three steps.<br />
                  One <span style={{ color: c.process.headlineAccentColor || P }}>transformation</span><span style={{ color: c.process.headlineAccentColor || P }}>.</span>
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#ddd]">
                {(c.process.steps || []).map(({ step, title, desc }, i) =>
                <motion.div
                  key={step}
                  variants={stagger(i * 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
                  className="py-10 sm:py-0 sm:px-10 first:pl-0 last:pr-0">
                  
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-heading text-sm font-bold text-[#bbb]">{step}</span>
                      {i === 0 && <FileText className="w-4 h-4 text-[#ccc]" />}
                      {i === 1 && <Phone className="w-4 h-4 text-[#ccc]" />}
                      {i === 2 && <Repeat className="w-4 h-4 text-[#ccc]" />}
                      {i > 2 && <ArrowUpRight className="w-4 h-4 text-[#ccc]" />}
                    </div>
                    <p className="font-heading text-2xl font-bold uppercase text-[#0a0a0a] tracking-tight mb-3">{title}</p>
                    <p className="text-sm text-[#666] leading-relaxed">{desc}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <div id="ic-faq">
            <ICFAQSection c={c.faq} accent={P} />
          </div>

          {/* ── STOP GUESSING CTA ── */}
          <section className="bg-[#f5f4f0] py-20 lg:py-28 px-6 lg:px-16 border-t border-[#ddd]">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="font-heading text-5xl sm:text-7xl lg:text-[8rem] font-bold uppercase tracking-tight text-[#0a0a0a] leading-[0.88]">
                Stop guessing.<br />
                <span style={{ color: P }}>Start understanding.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
                className="font-body text-base text-[#555] max-w-md leading-relaxed">
                Start understanding what your body needs.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center gap-3">
                <button
                  onClick={() => {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ event: 'book_call_click', location: 'ic_stop_guessing_cta' });
                    setModalOpen(true);
                  }}
                  style={{ backgroundColor: P }}
                  className="inline-flex items-center gap-2 font-body text-sm font-bold px-10 py-4 rounded-full hover:opacity-90 transition-opacity text-[#0a0a0a]">
                  Apply For The Inner Circle <ArrowUpRight className="w-4 h-4" />
                </button>
                <p className="font-body text-xs text-[#999]">Application Only • Limited Capacity</p>
              </motion.div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="bg-[#0a0a0a] py-24 lg:py-36 px-6 lg:px-16 border-t border-[#1e1e1e]">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              <motion.div
                variants={fadeLeft} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
                <p className="text-xs text-[#555] uppercase tracking-[0.2em] mb-6">{c.finalCta.eyebrow}</p>
                <h2 className="font-heading text-6xl sm:text-7xl lg:text-[8rem] font-bold uppercase tracking-tight text-off-white leading-[0.85] whitespace-pre-line">
                  {c.finalCta.headline} <span style={{ color: P }}>{c.finalCta.headlineAccent}</span>
                </h2>
              </motion.div>

              <motion.div
                variants={stagger(0.15)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
                className="lg:max-w-sm flex flex-col gap-6">
                
                <p className="text-sm text-white-muted leading-relaxed">{c.finalCta.body}</p>
                <div>
                  <button
                    onClick={() => {
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push({ event: 'book_call_click', location: 'ic_final_cta' });
                      setModalOpen(true);
                    }}
                    style={{ backgroundColor: P }}
                    className="inline-flex items-center gap-2 text-white font-body text-sm font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
                    
                    {c.finalCta.ctaText} <ArrowUpRight className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-[#555] mt-3">{c.finalCta.ctaSubtext}</p>
                </div>
              </motion.div>
            </div>
          </section>

        </main>

        <Footer />
      </div>

      <BookCallModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>);

}