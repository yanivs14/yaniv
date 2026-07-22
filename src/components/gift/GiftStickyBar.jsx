import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function GiftStickyBar({ visible }) {
  const [dismissed, setDismissed] = useState(false);
  if (!visible || dismissed) return null;

  const handleClick = () => {
    const el = document.getElementById("membership");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-md border-t border-orange-red/30"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-3 right-3 w-6 h-6 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-white-muted hover:text-off-white"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="font-body text-xs font-semibold text-off-white">
            Continue With Roye — <span className="text-orange-red">From $20/month</span>
          </span>
          <button
            onClick={handleClick}
            className="bg-orange-red text-dark-bg font-body text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            See Options
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}