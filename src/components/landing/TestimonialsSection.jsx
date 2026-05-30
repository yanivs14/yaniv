import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

function TestimonialCard({ t, index }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef();

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden flex-shrink-0 w-[72vw] sm:w-auto snap-start flex flex-col group hover:border-orange-red/30 transition-colors duration-300"
    >
      <div className="aspect-[3/4] overflow-hidden relative flex-shrink-0">
        {t.videoUrl ? (
          <>
            {!playing ? (
              <div className="w-full h-full cursor-pointer" onClick={handlePlay}>
                <img src={t.img || t.videoUrl} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-16 h-16 bg-orange-red rounded-full flex items-center justify-center shadow-lg shadow-orange-red/30">
                    <Play className="w-6 h-6 text-dark-bg fill-dark-bg ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <video ref={videoRef} src={t.videoUrl} className="w-full h-full object-cover" controls playsInline onClick={e => e.stopPropagation()} />
            )}
          </>
        ) : (
          <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/60 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-body text-sm text-off-white/80 leading-relaxed flex-1 mb-4 italic">"{t.quote}"</p>
        <div className="flex items-center gap-3 pt-4 border-t border-dark-border">
          <div className="w-8 h-8 rounded-full bg-orange-red/10 border border-orange-red/30 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-xs font-bold text-orange-red">{t.name?.[0]}</span>
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-off-white uppercase tracking-tight">{t.name}</p>
            <p className="font-body text-xs text-white-muted">{t.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const { content } = useSiteContent();
  const c = content.testimonials;
  const scrollRef = useRef();

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-28 bg-dark-bg" id="members">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">{c.eyebrow}</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
              {c.headline1}<br />
              <span className="text-orange-red">{c.headlineAccent}</span>
            </h2>
            <p className="font-body text-sm text-white-muted max-w-xs leading-relaxed sm:text-right">{c.subtitle}</p>
          </div>
        </motion.div>

        {/* Mobile: slider */}
        <div className="sm:hidden">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {c.items.map((t, i) => (
              <TestimonialCard key={i} t={t} index={i} />
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-surface flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-surface flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {c.items.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 border border-dark-border rounded-2xl p-8 mt-14 bg-dark-surface">
          {c.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-4xl lg:text-5xl font-bold text-orange-red">{stat.value}</div>
              <p className="mt-2 font-body text-xs text-white-muted leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}