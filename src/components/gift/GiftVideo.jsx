import React, { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function GiftVideo({
  youtubeUrl, videoUrl, poster, videoId,
  thumbnailLabel, thumbnailSub, durationLabel,
  onStarted, on25, on50, on75, onCompleted,
}) {
  const [playing, setPlaying] = useState(false);
  const [aspect, setAspect] = useState(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const fired = useRef({ 25: false, 50: false, 75: false, 100: false });
  const ytTime = useRef(0);
  const ytDur = useRef(0);

  const ytId = getYouTubeId(youtubeUrl);
  const posterImg = poster || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "");

  const checkMilestones = (pct) => {
    if (pct >= 0.25 && !fired.current[25]) { fired.current[25] = true; on25?.(); }
    if (pct >= 0.5 && !fired.current[50]) { fired.current[50] = true; on50?.(); }
    if (pct >= 0.75 && !fired.current[75]) { fired.current[75] = true; on75?.(); }
    if (pct >= 0.98 && !fired.current[100]) { fired.current[100] = true; onCompleted?.(); }
  };

  const handlePlay = () => {
    setPlaying(true);
    if (onStarted) onStarted();
    if (!ytId) setTimeout(() => videoRef.current?.play(), 50);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    checkMilestones(v.currentTime / v.duration);
  };

  // YouTube progress polling
  useEffect(() => {
    if (!playing || !ytId) return;
    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "getCurrentTime", args: [] }), "*");
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "getDuration", args: [] }), "*");
    }, 2000);
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === "infoDelivery" && data.info) {
          if (data.info.currentTime != null) ytTime.current = data.info.currentTime;
          if (data.info.duration != null) ytDur.current = data.info.duration;
          if (ytDur.current > 0) checkMilestones(ytTime.current / ytDur.current);
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => { clearInterval(interval); window.removeEventListener("message", handler); };
  }, [playing, ytId]);

  const containerAspect = aspect ? `${aspect}` : "16 / 9";

  if (!ytId && !videoUrl) {
    return (
      <div className="rounded-2xl overflow-hidden bg-black border border-dark-border w-full flex items-center justify-center text-white-dim font-body text-sm" style={{ aspectRatio: "16 / 9" }}>
        Add a video in the admin editor
      </div>
    );
  }

  const ThumbnailOverlay = () => (
    !playing && (
      <div className="absolute inset-0">
        {posterImg && <img src={posterImg} alt="" className="w-full h-full object-cover" loading="lazy" />}
        <span className="absolute inset-0 bg-black/40" />
        {(thumbnailLabel || durationLabel) && (
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 bg-gradient-to-t from-black/80 to-transparent">
            {durationLabel && (
              <span className="inline-block bg-orange-red text-dark-bg font-body text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">{durationLabel}</span>
            )}
            {thumbnailLabel && <p className="font-heading text-lg lg:text-xl font-bold text-off-white uppercase tracking-tight">{thumbnailLabel}</p>}
            {thumbnailSub && <p className="font-body text-sm text-white-muted mt-0.5">{thumbnailSub}</p>}
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <button onClick={handlePlay} aria-label="Play video" className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-orange-red flex items-center justify-center shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-orange-red/40">
            <Play className="w-7 h-7 lg:w-9 lg:h-9 text-dark-bg ml-1" fill="currentColor" />
          </button>
        </span>
      </div>
    )
  );

  return (
    <div className="rounded-2xl overflow-hidden bg-black border border-dark-border w-full relative shadow-[0_8px_60px_-12px_rgba(0,255,247,0.15)]" style={{ aspectRatio: containerAspect }}>
      {ytId ? (
        playing ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&cc_load_policy=1&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
            title={videoId || "Gift video"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
        ) : <ThumbnailOverlay />
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterImg || undefined}
            controls={playing}
            playsInline
            onLoadedMetadata={(e) => { const v = e.target; if (v?.videoWidth) setAspect(v.videoWidth / v.videoHeight); }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { if (!fired.current[100]) { fired.current[100] = true; onCompleted?.(); } }}
            className="w-full h-full object-contain"
          />
          <ThumbnailOverlay />
        </>
      )}
    </div>
  );
}