import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ICGallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null); // index or null

  if (!images.length) return null;

  const prev = () => setLightbox(i => (i - 1 + images.length) % images.length);
  const next = () => setLightbox(i => (i + 1) % images.length);

  const handleKey = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(null);
  };

  return (
    <>
      {/* Mosaic Grid */}
      <div className="columns-2 sm:columns-3 gap-2 sm:gap-3 space-y-2 sm:space-y-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="break-inside-avoid overflow-hidden rounded-xl cursor-pointer group relative"
            onClick={() => setLightbox(i)}
          >
            <img
              src={img.url}
              alt={img.alt || ""}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center"
            onClick={() => setLightbox(null)}
            onKeyDown={handleKey}
            tabIndex={0}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={e => { e.stopPropagation(); prev(); }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={e => { e.stopPropagation(); next(); }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={images[lightbox]?.url}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs font-body">
              {lightbox + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}