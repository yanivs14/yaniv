import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&modestbranding=1` : null;
}

function PillarsBanner({ imageUrl, videoUrl, youtubeUrl }) {
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  return (
    <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : videoUrl ? (
        <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="Pillars banner" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">No media yet</div>
      )}
    </div>
  );
}

export default function PillarsSection() {
  const { content } = useSiteContent();
  const c = content.pillars;

  return (
    <section className="py-12 lg:py-24 bg-dark-bg" id="benefits">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Left: text + pillars grid */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
                {c.headline1}<br />
                {c.headline2} <span className="text-orange-red">{c.headlineAccent}</span>
              </h2>
              <p className="mt-6 font-body text-base text-white-muted max-w-xl leading-relaxed">{c.subtitle}</p>
            </motion.div>

            {/* Pillars grid — 2x2 on desktop, fills the left column */}
            <div className="mt-10 grid grid-cols-2 gap-0 border-t border-dark-border flex-1">
              {c.pillars.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative pt-6 pb-8 px-6 border-dark-border overflow-hidden cursor-default border-r border-b [&:nth-child(2)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0 [&:nth-child(4)]:border-r-0 flex flex-col justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-red/0 to-orange-red/0 group-hover:from-orange-red/5 group-hover:to-orange-red/0 transition-all duration-500" />
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-orange-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="relative">
                    <div className="text-2xl text-orange-red mb-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 inline-block">{p.icon}</div>
                    <h3 className="font-heading text-4xl font-bold text-off-white uppercase tracking-tight mb-2 group-hover:text-orange-red transition-colors duration-300">{p.title}</h3>
                    <p className="font-body text-lg text-white-muted leading-loose tracking-wide group-hover:text-off-white/70 transition-colors duration-300">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: vertical video/image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PillarsBanner imageUrl={c.imageUrl} videoUrl={c.videoUrl} youtubeUrl={c.youtubeUrl} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}