import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { trackVideoEngaged } from "@/lib/analytics";

export default function SessionDemoSection() {
  const { content } = useSiteContent();
  const c = content.session;
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-20 lg:py-32 bg-dark-surface" id="method">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
            {c.headline1}<br />
            <span className="text-orange-red">{c.headlineAccent}</span> {c.headline2}
          </h2>
          <p className="mt-6 font-body text-base text-white-muted max-w-lg leading-relaxed">{c.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden aspect-video bg-dark-bg group cursor-pointer"
          onClick={() => { if (c.videoUrl) { trackVideoEngaged("session_demo", 0); setPlaying(true); } }}
        >
          {playing && c.videoUrl ? (
            <video src={c.videoUrl} autoPlay controls className="w-full h-full object-cover" />
          ) : (
            <>
              <img src={c.imageUrl} alt="Session demo" className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-orange-red rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="font-body text-sm text-white/70">{c.sessionLabel}</p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}