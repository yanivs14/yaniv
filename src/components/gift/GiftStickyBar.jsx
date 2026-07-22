import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GiftStickyBar({ visible, inCheckout }) {
  const [hidden, setHidden] = useState(false);

  // Hide during fullscreen
  useEffect(() => {
    const handler = () => setHidden(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (!visible || inCheckout || hidden) return null;

  const scrollToMembership = () => {
    document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-body text-[10px] text-orange-red font-bold uppercase tracking-tight leading-none">Continue With Roye</span>
            <span className="font-heading text-sm font-bold text-off-white leading-none">From $20/month</span>
          </div>
          <button onClick={scrollToMembership} className="bg-orange-red text-dark-bg font-body text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors flex-shrink-0 focus:outline-none focus:ring-4 focus:ring-orange-red/30">
            View Options
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}