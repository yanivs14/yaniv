import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

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

export default function HandstandVideoSection({ c }) {
  const [playing, setPlaying] = useState(false);
  const [videoAspect, setVideoAspect] = useState(null);
  const iframeRef = useRef(null);
  const videoRef = useRef(null);

  const ytId = getYouTubeId(c?.youtubeUrl);
  const poster = c?.posterUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "");
  const videoUrl = c?.videoUrl;

  const handleYtPlay = () => {
    setPlaying(true);
    const sendPlay = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    };
    [100, 500, 1000, 2000].forEach((delay) => setTimeout(sendPlay, delay));
  };

  const handleVideoPlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v && v.videoWidth && v.videoHeight) {
      setVideoAspect(v.videoWidth / v.videoHeight);
    }
  };

  const headline = c?.headline || "See It In Action";
  const headlineParts = headline.split(" ");
  const headlineLast = headlineParts.pop();

  const adminAspect = c?.posterAspect;
  const isPortrait = adminAspect === "vertical" || (!adminAspect && videoAspect != null && videoAspect < 1);
  const containerAspect = adminAspect === "vertical" ? "9 / 16"
    : adminAspect === "horizontal" ? "16 / 9"
    : videoAspect ? `${videoAspect}` : "16 / 9";

  return (
    <section className="relative bg-dark-bg py-14 lg:py-20 overflow-hidden" id="showcase">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-10"
        >
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-off-white uppercase tracking-tight">
            {headlineParts.join(" ")} <span className="text-orange-red">{headlineLast}</span>
          </h2>
          {c?.subheadline && (
            <p className="mt-4 font-body text-base sm:text-lg text-white-muted max-w-2xl mx-auto leading-relaxed">
              {c.subheadline}
            </p>
          )}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className={`rounded-2xl overflow-hidden bg-black border border-dark-border w-full relative shadow-[0_8px_60px_-12px_rgba(0,255,247,0.2)] ${isPortrait ? "max-w-sm mx-auto" : ""}`}
          style={{ aspectRatio: containerAspect }}
        >
          {ytId ? (
            <div className="relative w-full h-full">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                title="Showcase video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
              {!playing && (
                <button onClick={handleYtPlay} className="absolute inset-0 w-full h-full group block cursor-pointer">
                  {poster && <img src={poster} alt="Showcase" className="w-full h-full object-cover" />}
                  <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          ) : videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={poster || undefined}
                controls={playing}
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="w-full h-full object-contain"
              />
              {!playing && (
                <button
                  onClick={handleVideoPlay}
                  onTouchStart={(e) => { e.preventDefault(); handleVideoPlay(); }}
                  className="absolute inset-0 w-full h-full group flex items-center justify-center cursor-pointer bg-black"
                >
                  {poster && <img src={poster} alt="Showcase" className="absolute inset-0 w-full h-full object-contain" />}
                  <span className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <span className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
                  </span>
                </button>
              )}
            </>
          ) : poster ? (
            <img src={poster} alt="Showcase" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">
              Add a video or poster image in the admin editor
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}