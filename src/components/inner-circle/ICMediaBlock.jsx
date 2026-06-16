import React, { useState, useRef } from "react";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ICMediaBlock({ mediaUrl, mediaType, accent = "#FF2DF1" }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  if (!mediaUrl || mediaType === "none") return null;

  const isVideo = mediaType === "video";

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 50);
  };

  const handleClose = () => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-2 pb-12">
      <div
        className="relative w-full rounded-2xl lg:rounded-3xl overflow-hidden bg-[#0a0a0a]"
        style={{ aspectRatio: "16/9", maxHeight: "80vh" }}
      >
        {/* Thumbnail / image */}
        {mediaType === "image" && (
          <img
            src={mediaUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}

        {/* Video — shows poster until play pressed */}
        {isVideo && (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover"
              playsInline
              controls={playing}
              onClick={!playing ? handlePlay : undefined}
            />
            {/* Play button overlay */}
            <AnimatePresence>
              {!playing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  style={{ background: "rgba(10,10,10,0.35)" }}
                  onClick={handlePlay}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-2xl"
                    style={{ backgroundColor: accent }}
                  >
                    <Play className="w-7 h-7 lg:w-9 lg:h-9 fill-[#0a0a0a] text-[#0a0a0a] ml-1" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}


      </div>
    </div>
  );
}