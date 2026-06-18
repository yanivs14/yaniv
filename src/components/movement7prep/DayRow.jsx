import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { Play, ChevronDown, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function MediaPlayer({ mediaUrl, mediaType, accent = "#00fff7" }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

  if (!mediaUrl || mediaType === "none") return null;

  if (mediaType === "image") {
    return (
      <div className="w-full flex justify-center">
        <img src={mediaUrl} alt="" className="max-w-xs w-full rounded-xl object-cover" />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="relative rounded-xl overflow-hidden bg-[#111] inline-block max-w-xs w-full">
        <video
          ref={videoRef}
          src={mediaUrl}
          className="block w-full"
          style={{ maxHeight: "60vh" }}
          playsInline
          controls={playing}
          preload="metadata"
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <button
              onClick={handlePlay}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: accent }}
              aria-label="Play video"
            >
              <Play className="w-6 h-6 ml-1 text-[#0a0a0a]" fill="#0a0a0a" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DayRow({ d, accent, onJoin, mediaUrl, mediaType, todayNote }) {
  const rowRef = useRef(null);
  const btnRef = useRef(null);
  const labelRef = useRef(null);
  const isDay1 = d.day === 1;
  const [expanded, setExpanded] = useState(isDay1);

  const handleEnter = () => {
    if (isDay1) return;
    gsap.killTweensOf([rowRef.current, btnRef.current, labelRef.current]);
    gsap.to(rowRef.current, { backgroundColor: "#0d1a1a", duration: 0.35, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#F5F5F5", x: 4, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (isDay1) return;
    gsap.killTweensOf([rowRef.current, btnRef.current, labelRef.current]);
    gsap.to(rowRef.current, { backgroundColor: "transparent", duration: 0.35, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#666", x: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
  };

  const rightSlot = () => {
    if (isDay1) {
      return (
        <>
          <span
            className="text-xs font-body font-bold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: accent, color: "#0a0a0a" }}
          >
            TODAY
          </span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-300"
            style={{ color: accent, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </>
      );
    }
    if (d.day <= 3) {
      return <Lock className="w-4 h-4 flex-shrink-0" style={{ color: "#444" }} />;
    }
    return (
      <button
        ref={btnRef}
        onClick={onJoin}
        className="font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap"
        style={{ backgroundColor: accent, color: "#0a0a0a", opacity: 0 }}
      >
        Join Now
      </button>
    );
  };

  return (
    <div className={`border-b border-[#1e1e1e] ${isDay1 ? "-mx-4" : "-mx-2"}`}>
      <div
        ref={rowRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={isDay1 ? () => setExpanded(v => !v) : undefined}
        className={`flex items-center justify-between py-4 rounded-xl ${
          isDay1 ? "bg-[#0d1a1a] px-4 cursor-pointer" : "px-2 cursor-pointer"
        }`}
        style={{ minHeight: "60px" }}
      >
        <span
          className="font-heading text-xs font-bold flex-shrink-0 w-10 mr-2"
          style={{ color: isDay1 ? accent : "#333" }}
        >
          DAY {d.day}
        </span>

        <span
          ref={labelRef}
          className="font-heading text-lg sm:text-xl font-bold uppercase tracking-tight flex-1 min-w-0"
          style={{ color: isDay1 ? "#F5F5F5" : "#666" }}
        >
          {d.title}
        </span>

        <div className="flex-shrink-0 ml-3 flex items-center gap-2">
          {rightSlot()}
        </div>
      </div>

      {isDay1 && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-6 pt-3 flex flex-col items-center gap-4">
                {todayNote && (
                  <p className="font-body text-sm text-[#888] text-center">{todayNote}</p>
                )}
                <MediaPlayer mediaUrl={mediaUrl} mediaType={mediaType} accent={accent} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}