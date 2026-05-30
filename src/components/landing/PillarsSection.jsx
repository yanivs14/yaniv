import React from "react";
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
    <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-dark-surface border border-dark-border">
      {embedUrl ? (
        <iframe src={embedUrl} className="w-full h-full" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
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

const PILLAR_ICONS = { "◎": "M", "◈": "S", "◇": "C", "∞": "L" };

export default function PillarsSection() {
  const { content } = useSiteContent();
  const c = content.pillars;

  return (
    <section className="py-16 lg:py-28 bg-dark-bg" id="benefits">
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
              <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-4">{c.eyebrow}</p>
              <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
                {c.headline1}<br />
                {c.headline2} <span className="text-orange-red">{c.headlineAccent}</span>
              </h2>
              <p className="mt-6 font-body text-base text-white-muted max-w-xl leading-relaxed">{c.subtitle}</p>
            </motion.div>

            {/* Pillars grid — 2x2 */}
            <div className="mt-10 grid grid-cols-2 border border-dark-border rounded-2xl overflow-hidden flex-1">
              {c.pillars.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`group relative p-6 lg:p-8 hover:bg-dark-surface transition-colors duration-300 cursor-default
                    ${i % 2 === 0 ? "border-r border-dark-border" : ""}
                    ${i < 2 ? "border-b border-dark-border" : ""}
                  `}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-red scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="text-2xl text-orange-red mb-4 transition-transform duration-300 group-hover:scale-110 inline-block">{p.icon}</div>
                  <h3 className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-2 group-hover:text-orange-red transition-colors duration-300">{p.title}</h3>
                  <p className="font-body text-sm text-white-muted leading-relaxed group-hover:text-off-white/70 transition-colors duration-300">{p.desc}</p>
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