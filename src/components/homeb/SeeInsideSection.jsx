import { useState, useRef } from "react";
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
  const iframeRef = useRef(null);

  const ytId = getYouTubeId(c.youtubeUrl);
  const poster = c.imageUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "");

  const handlePlay = () => {
    setPlaying(true);
    // The iframe is pre-loaded (without autoplay). We call playVideo() via
    // postMessage so the play action happens within the user's tap gesture —
    // this avoids the "double tap" issue on mobile where YouTube shows its
    // own play button because the gesture expired during iframe loading.
    const sendPlay = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    };
    [100, 500, 1000, 2000].forEach((delay) => setTimeout(sendPlay, delay));
  };

  return (
    <section className="relative bg-gradient-to-b from-dark-surface via-dark-bg to-dark-surface py-14 lg:py-24 overflow-hidden border-y border-orange-red/15" id="see-inside">
      {/* Decorative glow accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-red/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-red/12 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {(() => {
              const h = c.headline || "See How It Works";
              const accent = c.headlineAccent;
              if (accent && h.endsWith(accent)) {
                const before = h.slice(0, h.length - accent.length);
                return <>{before.trim()}<br className="sm:hidden" /><span className="text-orange-red"> {accent}</span></>;
              }
              const parts = h.split(" ");
              const last = parts.pop();
              return <>{parts.join(" ")} <span className="text-orange-red">{last}</span></>;
            })()}
          </h2>
          {c.subtitle && (
            <p className="mt-4 font-body text-base sm:text-lg text-white-muted max-w-2xl mx-auto leading-relaxed">
              {c.subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden bg-dark-surface border-2 border-orange-red/25 aspect-video max-w-4xl mx-auto relative shadow-[0_8px_60px_-12px_rgba(0,255,247,0.25)]"
        >
          {ytId ? (
            <div className="relative w-full h-full">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                title="See how it works"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
              {!playing && (
                <button onClick={handlePlay} className="absolute inset-0 w-full h-full group block cursor-pointer">
                  {poster && <img src={poster} alt="See inside" className="w-full h-full object-cover" />}
                  <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
                    </span>
                  </span>
                </button>
              )}
            </div>
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