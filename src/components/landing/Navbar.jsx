import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { content } = useSiteContent();

  useEffect(() => {
    const onScroll = () => {
      setShowFloat(window.scrollY > 400);

      // Find the active section based on scroll position
      const sections = content.navbar.links
        .map(l => l.href?.replace("#", ""))
        .filter(Boolean);

      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 120) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [content.navbar.links]);
  const c = content.navbar;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const openQuiz = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-quiz"));
  };

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (!href || href === "#") return;
    // "program" section links to top of page (hero)
    if (href === "#program") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const offset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          {/* Brand */}
          <a href="#" className="font-heading text-xl font-bold tracking-widest text-off-white uppercase">
            {c.brand || "The Movement"}
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {c.links.map((l) => {
              const id = l.href?.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a key={l.label} href={l.href} onClick={(e) => scrollTo(e, l.href)}
                  className={`font-body text-sm transition-colors ${isActive ? "text-orange-red font-semibold" : "text-white-muted hover:text-off-white"}`}>
                  {l.label}
                </a>
              );
            })}
            <a href="#" onClick={openQuiz}
              className="font-body text-sm font-medium bg-orange-red text-dark-bg px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors">
              {c.cta}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden items-center justify-center w-11 h-11 rounded-xl bg-dark-surface border border-dark-border text-off-white hover:border-orange-red transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Floating CTA button */}
      <AnimatePresence>
        {showFloat && (
          <motion.a
            href="#"
            onClick={openQuiz}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 inset-x-0 z-50 font-body text-sm font-semibold bg-orange-red text-dark-bg py-4 text-center shadow-lg hover:bg-orange-red-hover transition-colors md:hidden"
          >
            {c.cta}
          </motion.a>
        )}
      </AnimatePresence>

      {/* Mobile fullscreen overlay — outside nav to avoid clipping */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 top-16 bg-dark-bg z-40 flex flex-col md:hidden overflow-hidden"
          >
            {/* Links — scrollable */}
            <div className="flex-1 px-6 pt-6 pb-4 flex flex-col gap-1 overflow-y-auto">
              {c.links.map((l, i) => {
                const id = l.href?.replace("#", "");
                const isActive = activeSection === id;
                return (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                    className={`flex items-center justify-between font-heading text-3xl font-bold uppercase tracking-tight transition-colors py-4 border-b border-dark-border ${isActive ? "text-orange-red" : "text-off-white hover:text-orange-red"}`}
                    onClick={(e) => scrollTo(e, l.href)}
                  >
                    {l.label}
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-orange-red" : "text-orange-red"}`} />
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