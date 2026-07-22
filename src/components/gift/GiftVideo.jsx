import React, { useState, useRef } from "react";
import { Play } from "lucide-react";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function GiftVideo({ youtubeUrl, videoUrl, poster, videoId, onStarted, on25, on50, on75, onCompleted, overlay, subOverlay }) {
  const [playing, setPlaying] = useState(false);
  const [aspect, setAspect] = useState(null);
  const videoRef = useRef(null);
  const fired25 = useRef(false);
  const fired50 = useRef(false);
  const fired75 = useRef(false);
  const fired100 = useRef(false);

  const ytId = getYouTubeId(youtubeUrl);
  const src = videoUrl;
  const posterImg = poster || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "");

  const handlePlay = () => {
    setPlaying(true);
    if (onStarted) onStarted();
    if (!ytId) setTimeout(() => videoRef.current?.play(), 50);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v && v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = v.currentTime / v.duration;
    if (pct >= 0.25 && !fired25.current) { fired25.current = true; if (on25) on25(); }
    if (pct >= 0.5 && !fired50.current) { fired50.current = true; if (on50) on50(); }
    if (pct >= 0.75 && !fired75.current) { fired75.current = true; if (on75) on75(); }
    if (pct >= 0.98 && !fired100.current) { fired100.current = true; if (onCompleted) onCompleted(); }
  };

  const containerAspect = aspect ? `${aspect}` : "16 / 9";

  if (!ytId && !src) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-black border border-dark-border w-full flex items-center justify-center text-white-dim font-body text-sm"
        style={{ aspectRatio: "16 / 9" }}
      >
        Add a video in the admin editor
      </div>
    );
  }

  const renderOverlay = () => (overlay || subOverlay) && (
    <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6 z-10 pointer-events-none">
      {overlay && <p className="font-heading text-sm lg:text-base font-bold text-white uppercase tracking-tight leading-tight drop-shadow-lg">{overlay}</p>}
      {subOverlay && <p className="font-body text-xs text-white/80 mt-0.5 drop-shadow-lg">{subOverlay}</p>}
    </div>
  );

  return (
    <div
      className="rounded-2xl overflow-hidden bg-black border border-dark-border w-full relative shadow-[0_8px_60px_-12px_rgba(0,255,247,0.15)]"
      style={{ aspectRatio: containerAspect }}
    >
      {ytId ? (
        playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&cc_load_policy=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
            title={videoId || "Gift video"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        ) : (
          <div className="absolute inset-0">
            {posterImg && <img src={posterImg} alt="" className="w-full h-full object-cover" />}
            <span className="absolute inset-0 bg-black/30" />
            {renderOverlay()}
            <span className="absolute inset-0 flex items-center justify-center">
              <button onClick={handlePlay} aria-label="Play video" className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
              </button>
            </span>
          </div>
        )
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={posterImg || undefined}
            controls={playing}
            playsInline
            preload="none"
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { if (!fired100.current) { fired100.current = true; if (onCompleted) onCompleted(); } }}
            className="w-full h-full object-contain"
          />
          {!playing && (
            <div className="absolute inset-0 bg-black">
              {posterImg && <img src={posterImg} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              <span className="absolute inset-0 bg-black/40" />
              {renderOverlay()}
              <span className="absolute inset-0 flex items-center justify-center">
                <button onClick={handlePlay} aria-label="Play video" className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
                </button>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}