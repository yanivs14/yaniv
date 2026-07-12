import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function AboutSection() {
  const { content } = useSiteContent();
  const c = content?.about || {};
  const gallery = c.gallery || [];
  const [current, setCurrent] = useState(0);
  if (!content) return null;

  // All images: main imageUrl first, then gallery images (type=image only)
  const images = [
    ...(c.imageUrl ? [c.imageUrl] : []),
    ...gallery.filter(g => g.type === "image" && g.url).map(g => g.url),
  ];

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <section className="py-12 lg:py-24 bg-dark-surface" id="roye">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Image slider — order-2 on mobile (below text), order-1 on desktop (left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 aspect-[4/5] rounded-2xl overflow-hidden bg-dark-bg border border-dark-border relative"
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[current]}
                  alt="About"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-off-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-off-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrent(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-orange-red" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">
                No image yet
              </div>
            )}
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow || "About"}</p>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-6">
              {c.headline || "About"}<br />
              {c.headlineAccent && <span className="text-orange-red">{c.headlineAccent}</span>}
            </h2>
            <div className="space-y-5">
              {(c.text || "").split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} className="font-body text-base lg:text-lg text-white-muted leading-relaxed">{para}</p>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}