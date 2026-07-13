import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function SeeInsideSection() {
  const { content } = useSiteContent();
  const c = content.homebSeeInside || {};
  const [playing, setPlaying] = useState(false);

  const ytId = getYouTubeId(c.youtubeUrl);
  const poster = c.imageUrl || `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;

  return (
    <section className="bg-dark-bg py-12 lg:py-20" id="see-inside">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <p className="font-body text-sm text-orange-red uppercase tracking-widest mb-3">{c.eyebrow || "This is what you're joining"}</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {c.headline || "See How It Works"}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden bg-dark-surface border border-dark-border aspect-video max-w-4xl mx-auto relative"
        >
          {playing && ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title="See how it works"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          ) : ytId ? (
            <button onClick={() => setPlaying(true)} className="relative w-full h-full group block">
              <img src={poster} alt="See inside" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
                </span>
              </span>
            </button>
          ) : c.videoUrl ? (
            <video src={c.videoUrl} autoPlay muted loop playsInline controls className="w-full h-full object-cover" />
          ) : c.imageUrl ? (
            <img src={c.imageUrl} alt="See inside" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">
              Upload a video or image showing the learning interface
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}