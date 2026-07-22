import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play } from "lucide-react";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

let ytApiPromise = null;
function loadYTApi() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

export default function GiftVideo({ youtubeUrl, videoUrl, poster, videoId, onStarted, on50, onCompleted }) {
  const [playing, setPlaying] = useState(false);
  const [aspect, setAspect] = useState(null);
  const videoRef = useRef(null);
  const ytDivRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const pollRef = useRef(null);
  const fired50 = useRef(false);
  const fired100 = useRef(false);
  const startedRef = useRef(false);

  const ytId = getYouTubeId(youtubeUrl);
  const src = videoUrl;
  const posterImg = poster || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "");

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => {
    if (!playing || !ytId || !ytDivRef.current) return;
    let cancelled = false;
    loadYTApi().then(() => {
      if (cancelled || !ytDivRef.current) return;
      ytPlayerRef.current = new window.YT.Player(ytDivRef.current, {
        videoId: ytId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          autoplay: 1,
          cc_load_policy: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (e) => { e.target.playVideo(); },
          onStateChange: (e) => {
            if (e.data === 1) {
              if (!startedRef.current) {
                startedRef.current = true;
                if (onStarted) onStarted();
              }
              stopPolling();
              pollRef.current = setInterval(() => {
                const p = ytPlayerRef.current;
                if (!p || !p.getDuration) return;
                const dur = p.getDuration();
                if (!dur) return;
                const pct = p.getCurrentTime() / dur;
                if (pct >= 0.5 && !fired50.current) {
                  fired50.current = true;
                  if (on50) on50();
                }
                if (pct >= 0.98 && !fired100.current) {
                  fired100.current = true;
                  if (onCompleted) onCompleted();
                  stopPolling();
                }
              }, 1000);
            } else if (e.data === 0) {
              if (!fired100.current) {
                fired100.current = true;
                if (onCompleted) onCompleted();
              }
              stopPolling();
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      stopPolling();
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [playing, ytId]);

  const handlePlay = () => {
    setPlaying(true);
    if (!ytId) {
      if (onStarted) onStarted();
      setTimeout(() => videoRef.current?.play(), 50);
    }
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v && v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = v.currentTime / v.duration;
    if (pct >= 0.5 && !fired50.current) { fired50.current = true; if (on50) on50(); }
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

  return (
    <div
      className="rounded-2xl overflow-hidden bg-black border border-dark-border w-full relative shadow-[0_8px_60px_-12px_rgba(0,255,247,0.15)]"
      style={{ aspectRatio: containerAspect }}
    >
      {ytId ? (
        playing ? (
          <div ref={ytDivRef} className="w-full h-full" />
        ) : (
          <div className="absolute inset-0">
            {posterImg && <img src={posterImg} alt="" className="w-full h-full object-cover" />}
            <span className="absolute inset-0 bg-black/30" />
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