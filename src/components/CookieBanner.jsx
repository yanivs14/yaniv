import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility } from "lucide-react";

const COOKIE_KEY = "kinetiqo_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-4 left-0 right-0 mx-auto z-[9999] w-[calc(100%-2rem)] max-w-lg"
        >
          <div className="bg-dark-surface border border-dark-border rounded-xl px-3 py-2.5 shadow-2xl flex items-center gap-3">
            <p className="font-body text-xs text-off-white/70 leading-snug flex-1">
              We use cookies per our{" "}
              <a href="/privacy-policy" className="underline underline-offset-2 text-off-white hover:text-orange-red transition-colors">
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={accept}
                className="bg-orange-red text-dark-bg font-body text-xs font-semibold py-1.5 px-4 rounded-full hover:bg-orange-red-hover transition-colors whitespace-nowrap"
              >
                I Agree
              </button>
              <button
                onClick={decline}
                className="text-white-muted font-body text-xs py-1.5 px-3 rounded-full border border-dark-border hover:border-orange-red/40 transition-colors whitespace-nowrap"
              >
                No
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}