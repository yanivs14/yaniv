import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HandstandSolution({ c }) {
  const benefits = c?.benefits || [];
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [openBenefit, setOpenBenefit] = useState(0);

  useEffect(() => {
    if (!c?.videoUrl || videoLoaded) return;
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVideoLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [c?.videoUrl, videoLoaded]);
  return (
    <section className="py-20 lg:py-28 bg-dark-surface relative overflow-hidden">
      {/* Glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-red/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-red/3 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Video / Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-1"
          >
            <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[4/5] rounded-3xl overflow-hidden border border-dark-border group cursor-pointer">
              {c?.videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoLoaded ? c.videoUrl : undefined}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="none"
                />
              ) : (
                <img
                  src={c?.imageUrl || "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80"}
                  alt="Handstand training"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="font-body text-xs text-off-white bg-dark-bg/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {c?.videoLabel || "Watch the method"}
                </span>
                {c?.videoDuration && (
                  <span className="font-heading text-xs font-bold text-orange-red bg-dark-bg/60 backdrop-blur-sm px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {c.videoDuration}
                  </span>
                )}
              </div>
            </div>
            {/* Floating stat card */}
            {(c?.statValue || c?.statLabel) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-5 -right-3 sm:-right-5 bg-dark-bg border border-orange-red/30 rounded-2xl p-4 shadow-xl"
              >
                {c?.statValue && <p className="font-heading text-3xl font-bold text-orange-red">{c.statValue}</p>}
                {c?.statLabel && <p className="font-body text-xs text-white-dim uppercase tracking-wider">{c.statLabel}</p>}
              </motion.div>
            )}
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2"
          >
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight mb-5 leading-[0.95]">
              {c?.headline?.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-orange-red">{c?.headline?.split(" ").slice(-2).join(" ")}</span>
            </h2>
            <p className="font-body text-base text-white-muted mb-8 leading-relaxed max-w-lg">{c?.subtitle}</p>

            {/* Benefits Accordion */}
            <div className="space-y-0">
              {benefits.map((b, i) => {
                const isOpen = openBenefit === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="border-b border-dark-border last:border-0"
                  >
                    <button
                      onClick={() => setOpenBenefit(isOpen ? -1 : i)}
                      className="w-full flex items-center gap-4 py-4 text-left group"
                    >
                      <span className={`font-heading text-2xl font-bold w-8 flex-shrink-0 transition-colors ${isOpen ? "text-orange-red" : "text-white-dim group-hover:text-orange-red"}`}>
                        0{i + 1}
                      </span>
                      <h3 className="flex-1 font-heading text-lg font-bold text-off-white uppercase tracking-wide">{b.title}</h3>
                      <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-orange-red" : "text-white-dim group-hover:text-orange-red"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="font-body text-sm text-white-muted leading-relaxed pb-4 pl-12">{b.desc}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}