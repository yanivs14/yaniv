import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { useState } from "react";

function TestimonialCard({ t }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef();

  const handleMediaClick = () => {
    if (t.videoUrl) {
      setPlaying(true);
      setTimeout(() => videoRef.current?.play(), 50);
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden flex-shrink-0 w-72 sm:w-80 snap-start">
      <div className="aspect-[3/4] overflow-hidden relative cursor-pointer" onClick={handleMediaClick}>
        {t.videoUrl ? (
          <>
            {!playing ? (
              <>
                <img src={t.img || t.videoUrl} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-14 h-14 bg-orange-red rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-dark-bg fill-dark-bg ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <video ref={videoRef} src={t.videoUrl} className="w-full h-full object-cover" controls playsInline />
            )}
          </>
        ) : (
          <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-5">
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-orange-red text-orange-red" />)}
        </div>
        <p className="font-body text-sm text-off-white/80 leading-relaxed mb-4">"{t.quote}"</p>
        <div>
          <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">{t.name}</p>
          <p className="font-body text-xs text-white-muted">{t.role}</p>
        </div>
      </div>
    </div>
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
    <section className="py-20 lg:py-32 bg-dark-bg" id="members">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
              {c.headline1}<br />
              <span className="text-orange-red">{c.headlineAccent}</span>
            </h2>
            <p className="mt-4 font-body text-base text-white-muted max-w-lg leading-relaxed">{c.subtitle}</p>
          </div>

        </motion.div>

        <div className="relative">
          {/* Mobile: always slider */}
          <div className="sm:hidden">
            <div ref={scrollRef} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {c.items.map((t, i) => (
                <TestimonialCard key={i} t={t} />
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
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {c.items.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 border-t border-dark-border pt-12 mt-12">
          {c.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-5xl lg:text-6xl font-bold text-orange-red">{stat.value}</div>
              <p className="mt-2 font-body text-sm text-white-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}