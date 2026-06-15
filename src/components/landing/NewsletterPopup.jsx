import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "newsletter_dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Trigger after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000);

    // OR trigger when 3rd section enters viewport
    const sections = document.querySelectorAll("section, [data-section]");
    const target = sections[2];
    let observer;
    if (target) {
      observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { clearTimeout(timer); setVisible(true); observer.disconnect(); } },
        { threshold: 0.3 }
      );
      observer.observe(target);
    }

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await base44.entities.NewsletterSubscriber.create({ email: email.trim(), source: "popup" });
      setSubmitted(true);
      setTimeout(dismiss, 2000);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="bg-dark-surface border border-dark-border rounded-2xl px-6 py-5 shadow-2xl">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white-muted hover:text-off-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!submitted ? (
              <>
                <p className="font-body text-[10px] text-orange-red uppercase tracking-widest mb-1">Free tips & updates</p>
                <p className="font-heading text-xl font-bold text-off-white uppercase tracking-tight mb-3">
                  Join The Movement
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className={`w-full bg-dark-bg border rounded-xl px-4 py-3 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${error ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
                  />
                  {error && <p className="text-xs text-red-400 font-body">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                      : <>Subscribe <ArrowRight className="w-3.5 h-3.5" /></>}
                  </button>
                </form>
                <p className="mt-2 text-center font-body text-[10px] text-white-dim">No spam. Unsubscribe anytime.</p>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="font-heading text-xl font-bold text-orange-red uppercase tracking-tight mb-1">You're in! 🎉</p>
                <p className="font-body text-sm text-white-muted">Thanks for subscribing.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}