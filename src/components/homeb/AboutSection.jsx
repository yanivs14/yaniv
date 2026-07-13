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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 rounded-2xl overflow-hidden bg-dark-bg border border-dark-border relative"
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[current]}
                  alt="About"
                  className="w-full h-auto block transition-opacity duration-300"
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {c.headline || "About"}<br />
              {c.headlineAccent && <span className="text-orange-red">{c.headlineAccent}</span>}
            </h2>
            <div className="space-y-5">
              {(c.text || "").split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} className="font-body text-base lg:text-lg text-off-white/90 leading-relaxed">{para}</p>
              ))}
            </div>

            {(c.iconList?.length > 0) && (
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {c.iconList.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="group relative bg-dark-bg border border-dark-border rounded-2xl p-5 hover:border-orange-red/50 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-red/5 rounded-full blur-2xl group-hover:bg-orange-red/10 transition-all duration-500" />
                      <div className="relative flex flex-col gap-3">
                        <span className="w-10 h-10 rounded-xl bg-orange-red/10 border border-orange-red/30 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-red/20 group-hover:scale-110 transition-all duration-300">
                          <Check className="w-5 h-5 text-orange-red" strokeWidth={3} />
                        </span>
                        <span className="font-body text-sm text-off-white font-semibold leading-snug">{item}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <a
                  href="#pricing"
                  className="mt-5 flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
                >
                  Join Us <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}