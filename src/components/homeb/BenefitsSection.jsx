import React from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&modestbranding=1` : null;
}

export default function BenefitsSection() {
  const { content } = useSiteContent();
  const c = content?.pillars || {};
  const pillars = c.pillars || [];
  if (!content) return null;

  const embedUrl = getYoutubeEmbedUrl(c.youtubeUrl);

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="benefits" data-section="benefits">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Left: heading + pillars grid */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
                {c.headline1 || "The Program's"}<br />
                {c.headline2 && <>{c.headline2} </>}
                {c.headlineAccent && <span className="text-orange-red">{c.headlineAccent}</span>}
              </h2>
              {c.subtitle && (
                <p className="mt-6 font-body text-base text-white-muted max-w-xl leading-relaxed">{c.subtitle}</p>
              )}
            </motion.div>

            {/* Pillars grid — 2x2 */}
            <div className="mt-10 grid grid-cols-2 gap-0 border-t border-l border-dark-border flex-1">
              {pillars.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative pt-6 pb-8 px-6 border-dark-border border-r border-b flex flex-col justify-center"
                >
                  <div className="text-2xl text-orange-red mb-4 inline-block">{p.icon}</div>
                  <h3 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-2">{p.title}</h3>
                  <p className="font-body text-sm sm:text-base text-white-muted leading-snug">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: media — YouTube > video > image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface"
          >
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : c.videoUrl ? (
              <video src={c.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            ) : c.imageUrl ? (
              <img src={c.imageUrl} alt="Benefits" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">No media yet</div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}