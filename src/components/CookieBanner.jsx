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
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-lg"
        >
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 shadow-2xl">
            <p className="font-body text-sm text-off-white/80 leading-relaxed mb-5">
              We use cookies to improve your browsing experience in accordance with the Computer Law (1995, Section 17).
              By clicking "I Agree", you consent to our use of cookies.{" "}
              <a href="/privacy-policy" className="underline underline-offset-4 text-off-white hover:text-orange-red transition-colors">
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={accept}
                className="flex-1 bg-orange-red text-dark-bg font-body text-sm font-semibold py-2.5 px-5 rounded-full hover:bg-orange-red-hover transition-colors"
              >
                I Agree
              </button>
              <button
                onClick={decline}
                className="flex items-center gap-2 border border-dark-border text-off-white font-body text-sm py-2.5 px-5 rounded-full hover:border-orange-red/50 transition-colors"
              >
                <Accessibility className="w-4 h-4 text-orange-red" />
                No thanks
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}