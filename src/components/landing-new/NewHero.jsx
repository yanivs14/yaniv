import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Dumbbell, Clock, RefreshCcw } from "lucide-react";
import Quiz from "@/components/landing/Quiz";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function NewHero() {
  const [quizOpen, setQuizOpen] = useState(false);
  const { content } = useSiteContent();
  const c = content.hero || {};

  useEffect(() => {
    const handler = () => setQuizOpen(true);
    window.addEventListener("open-quiz", handler);
    return () => window.removeEventListener("open-quiz", handler);
  }, []);

  return (
    <>
      <section className="pt-20 pb-10 lg:pt-32 lg:pb-20 bg-dark-bg" id="program">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-off-white uppercase tracking-tight">
                You don't need more<br />
                gym hours. You need<br />
                <span className="text-orange-red">control</span> of your<br />
                own body.
              </h1>

              <p className="mt-8 font-body text-base lg:text-lg text-white-muted max-w-lg leading-relaxed">
                Most pain isn't weakness — it's your joints losing control of their range. The Movement rebuilds that control from the floor up, in 10–15 minutes a day, using nothing but your bodyweight.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <button
                  onClick={() => setQuizOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors w-fit"
                >
                  Join The Movement
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex flex-wrap items-center gap-2 font-body text-xs">
                  <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                    <Dumbbell className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                    Bodyweight only
                  </span>
                  <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                    <Clock className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                    10–15 min a day
                  </span>
                  <span className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-white-muted">
                    <RefreshCcw className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                    Cancel anytime
                  </span>
                </div>
              </div>

              <p className="mt-6 font-body text-sm text-white-dim max-w-md">
                For everyone from desk-bound and stiff → to lifters who train hard but still ache → to elite athletes.
              </p>

              {/* Mobile video */}
              <div className="lg:hidden rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface mt-6">
                {c.videoUrl ? (
                  <video src={c.videoUrl} poster={c.videoPoster} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : c.videoPoster ? (
                  <img src={c.videoPoster} alt="Movement practice" className="w-full h-full object-cover" fetchpriority="high" />
                ) : null}
              </div>
            </motion.div>

            {/* Right - Video / Image (desktop only) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface">
                {c.videoUrl ? (
                  <video src={c.videoUrl} poster={c.videoPoster} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : c.videoPoster ? (
                  <img src={c.videoPoster} alt="Movement practice" className="w-full h-full object-cover" fetchpriority="high" />
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {quizOpen && <Quiz onClose={() => setQuizOpen(false)} />}
      </AnimatePresence>
    </>
  );
}