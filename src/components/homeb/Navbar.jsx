import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [inPricing, setInPricing] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { content } = useSiteContent();

  useEffect(() => {
    const onScroll = () => {
      setShowFloat(window.scrollY > 400);
    let hideFloat = false;
    const pricingEl = document.getElementById("pricing");
    if (pricingEl) {
      const rect = pricingEl.getBoundingClientRect();
      hideFloat = hideFloat || (rect.top < window.innerHeight && rect.bottom > 0);
    }
    const finalCtaEl = document.getElementById("final-cta");
    if (finalCtaEl) {
      const rect = finalCtaEl.getBoundingClientRect();
      hideFloat = hideFloat || (rect.top < window.innerHeight && rect.bottom > 0);
    }
    setInPricing(hideFloat);
      if (window.scrollY < 200) {
        setActiveSection("program");
        return;
      }
      const allSections = Array.from(document.querySelectorAll("section[id]"));
      let current = "program";
      for (const el of allSections) {
        if (el.offsetHeight === 0) continue;
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!content) return null;
  const c = content.navbar;

  const openQuiz = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-quiz"));
  };

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (!href || href === "#") return;
    if (href === "#program") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    let id = href.replace("#", "");
    if (id === "inner-circle" && window.innerWidth < 768) {
      id = "inner-circle-text";
    }
    const el = document.getElementById(id);
    if (el) {
      const offset = id === "inner-circle-text" ? 80 : 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          <a href="#" className="font-heading text-xl font-bold tracking-widest text-off-white uppercase">
            {c.brand || "The Movement"}
          </a>
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {c.links.map((l) => {
              const labelLower = l.label.toLowerCase();
              const isWhoLink = labelLower.includes("who");
              const effectiveHref = isWhoLink ? "#who" : l.href;
              const id = effectiveHref?.startsWith("#") ? effectiveHref.replace("#", "") : null;
              const isProgramLink = labelLower.includes("program");
              const isActive = id !== null && (activeSection === id || (isProgramLink && (activeSection === "benefits" || activeSection === "see-inside")));
              return (
                <a key={l.label} href={effectiveHref} onClick={(e) => scrollTo(e, effectiveHref)}
                  className={`font-body text-sm font-medium transition-colors ${isActive ? "text-orange-red" : "text-white-muted hover:text-off-white"}`}>
                  {l.label}
                </a>
              );
            })}
            <a href="#pricing" onClick={(e) => scrollTo(e, "#pricing")}
              className="font-body text-sm font-medium bg-orange-red text-dark-bg px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors whitespace-nowrap">
              {c.cta}
            </a>
          </div>
          <button
            className="flex lg:hidden items-center justify-center w-11 h-11 rounded-xl bg-dark-surface border border-dark-border text-off-white hover:border-orange-red transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showFloat && !inPricing && (
          <motion.a
            href="#pricing"
            onClick={(e) => scrollTo(e, "#pricing")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-0 right-0 mx-auto w-fit z-50 font-body text-sm font-semibold bg-orange-red text-dark-bg px-8 py-3.5 rounded-full shadow-xl hover:bg-orange-red-hover transition-colors lg:hidden whitespace-nowrap"
          >
            {c.cta}
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 top-16 bg-dark-bg z-40 flex flex-col lg:hidden overflow-hidden"
          >
            <div className="flex-1 px-6 pt-6 pb-4 flex flex-col gap-1 overflow-y-auto">
              {c.links.map((l, i) => {
                const labelLower = l.label.toLowerCase();
                const isWhoLink = labelLower.includes("who");
                const effectiveHref = isWhoLink ? "#who" : l.href;
                const id = effectiveHref?.startsWith("#") ? effectiveHref.replace("#", "") : null;
                const isProgramLink = labelLower.includes("program");
                const isActive = id !== null && (activeSection === id || (isProgramLink && (activeSection === "benefits" || activeSection === "see-inside")));
                return (
                  <motion.a
                    key={l.label}
                    href={effectiveHref}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                    className={`flex items-center justify-between font-heading text-3xl font-bold uppercase tracking-tight transition-colors py-4 border-b border-dark-border ${isActive ? "text-orange-red" : "text-off-white hover:text-orange-red"}`}
                    onClick={(e) => scrollTo(e, effectiveHref)}
                  >
                    {l.label}
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-orange-red" : "text-white-dim"}`} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}