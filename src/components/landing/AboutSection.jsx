import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState, useRef } from "react";
import { useSiteContent } from "@/lib/SiteContentContext";

function GalleryItem({ item }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef();

  if (!item.url) return null;

  const isVideo = item.type === "video";

  const handleClick = () => {
    if (isVideo) {
      setPlaying(true);
      setTimeout(() => videoRef.current?.play(), 50);
    }
  };

  return (
    <div
      className="aspect-square rounded-xl overflow-hidden relative cursor-pointer bg-dark-surface border border-dark-border"
      onClick={handleClick}
    >
      {isVideo ? (
        playing ? (
          <video ref={videoRef} src={item.url} className="w-full h-full object-cover" controls playsInline />
        ) : (
          <>
            {item.thumb ? (
              <img src={item.thumb} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={item.url} className="w-full h-full object-cover" muted />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 bg-orange-red rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-dark-bg fill-dark-bg ml-0.5" />
              </div>
            </div>
          </>
        )
      ) : (
        <img src={item.url} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}

export default function AboutSection() {
  const { content } = useSiteContent();
  const c = content.about || {};
  const gallery = c.gallery || [];

  return (
    <section className="py-20 lg:py-32 bg-dark-surface" id="about">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* About: image + headline + text */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 lg:mb-28">
          {/* Image / Video */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-dark-bg border border-dark-border"
          >
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.headline || "About"} className="w-full h-full object-cover" />
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
          >
            <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow || "About"}</p>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight mb-6">
              {c.headline || "About"}<br />
              {c.headlineAccent && <span className="text-orange-red">{c.headlineAccent}</span>}
            </h2>
            <p className="font-body text-base text-white-muted leading-relaxed whitespace-pre-line">{c.text}</p>
          </motion.div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-6">Gallery</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map((item, i) => (
                <GalleryItem key={i} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}