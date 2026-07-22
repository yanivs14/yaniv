import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";
import AccentText from "@/components/handstand/AccentText";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function HandstandVideoSection({ c }) {
  const [playing, setPlaying] = useState(false);
  const [videoAspect, setVideoAspect] = useState(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const { ctaText } = useHandstandOffer();

  const ytId = getYouTubeId(c?.youtubeUrl);
  const poster = c?.posterUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "");
  const videoUrl = c?.videoUrl;

  const handleYtPlay = () => {
    setPlaying(true);
    const sendPlay = () => iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }), "*"
    );
    [100, 500, 1000, 2000].forEach((d) => setTimeout(sendPlay, d));
  };

  const handleVideoPlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v && v.videoWidth && v.videoHeight) setVideoAspect(v.videoWidth / v.videoHeight);
  };

  const handleCheckout = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_method_video");
    setLoading(false);
  };

  const adminAspect = c?.posterAspect;
  const containerAspect = adminAspect === "vertical" ? "9 / 16"
    : adminAspect === "horizontal" ? "16 / 9"
    : videoAspect ? `${videoAspect}` : "16 / 9";
  const isPortrait = adminAspect === "vertical" || (!adminAspect && videoAspect != null && videoAspect < 1);

  return (
    <section className="bg-dark-bg py-12 lg:py-16 overflow-hidden">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-8"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-off-white uppercase tracking-tight leading-[0.95]">
            <AccentText text={c?.headline} />
          </h2>
          {c?.subheadline && (
            <p className="mt-3 font-body text-sm lg:text-base text-white-muted max-w-2xl mx-auto leading-relaxed">{c.subheadline}</p>
          )}
        </motion.div>
      </div>
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl overflow-hidden bg-black border border-dark-border w-full relative shadow-[0_8px_60px_-12px_rgba(0,255,247,0.15)] ${isPortrait ? "max-w-sm mx-auto" : ""}`}
          style={{ aspectRatio: containerAspect }}
        >
          {ytId ? (
            <div className="relative w-full h-full">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                title="Method video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
              {!playing && (
                <div className="absolute inset-0">
                  {poster && <img src={poster} alt="Method" className="w-full h-full object-cover" />}
                  <span className="absolute inset-0 bg-black/30" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <button onClick={handleYtPlay} aria-label="Play video" className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-orange-red flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 lg:w-7 lg:h-7 text-dark-bg ml-1" fill="currentColor" />
                    </button>
                  </span>
                </div>
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
                <div className="absolute inset-0 bg-black">
                  {poster && <img src={poster} alt="Method" className="absolute inset-0 w-full h-full object-cover" />}
                  <span className="absolute inset-0 bg-black/40" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <button onClick={handleVideoPlay} aria-label="Play video" className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-orange-red flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 lg:w-7 lg:h-7 text-dark-bg ml-1" fill="currentColor" />
                    </button>
                  </span>
                </div>
              )}
            </>
          ) : poster ? (
            <img src={poster} alt="Method" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white-dim font-body text-sm">Add a video in the admin editor</div>
          )}
        </motion.div>
        <div className="text-center mt-6">
          <button
            onClick={handleCheckout}
            disabled={loading}
            data-cta-id="handstand_video_cta"
            className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </section>
  );
}