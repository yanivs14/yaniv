import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ICNavbar({ links = [], cta = "Apply Now", accentColor = "#FF2DF1", onCtaClick }) {
  const [open, setOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setShowFloat(window.scrollY > 400);
      if (window.scrollY < 200) { setActiveSection(""); return; }
      const allSections = Array.from(document.querySelectorAll("section[id]"));
      let current = "";
      for (const el of allSections) {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (!href || href === "#") return;
    if (href === "#top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          {/* Brand */}
          <a href="/inner-circle" className="font-heading text-xl font-bold tracking-widest text-[#F5F5F5] uppercase">
            The Movement
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => {
              const id = l.href?.startsWith("#") ? l.href.replace("#", "") : null;
              const isActive = id && activeSection === id;
              return (
                <a key={l.label} href={l.href} onClick={(e) => scrollTo(e, l.href)}
                  className="font-body text-sm transition-colors"
                  style={{ color: isActive ? accentColor : "#C8C8C8" }}>
                  {l.label}
                </a>
              );
            })}
            <button
              onClick={onCtaClick}
              className="font-body text-sm font-bold px-5 py-2.5 rounded-full transition-colors hover:opacity-90"
              style={{ backgroundColor: accentColor, color: "#0a0a0a" }}>
              {cta}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden items-center justify-center w-11 h-11 rounded-xl bg-[#161616] border border-[#2a2a2a] text-[#F5F5F5] hover:border-[var(--accent)] transition-colors"
            style={{ "--accent": accentColor }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Floating CTA */}
      <AnimatePresence>
        {showFloat && (
          <motion.button
            onClick={onCtaClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-0 right-0 mx-auto w-fit z-50 font-body text-sm font-bold px-8 py-3.5 rounded-full shadow-xl transition-colors md:hidden whitespace-nowrap"
            style={{ backgroundColor: accentColor, color: "#0a0a0a" }}>
            {cta}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 top-16 bg-[#0a0a0a] z-40 flex flex-col md:hidden overflow-hidden">
            <div className="flex-1 px-6 pt-6 pb-4 flex flex-col gap-1 overflow-y-auto">
              {links.map((l, i) => {
                const id = l.href?.startsWith("#") ? l.href.replace("#", "") : null;
                const isActive = id && activeSection === id;
                return (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                    className="flex items-center justify-between font-heading text-3xl font-bold uppercase tracking-tight transition-colors py-4 border-b border-[#1e1e1e] text-[#F5F5F5]"
                    style={{ color: isActive ? accentColor : "#F5F5F5" }}
                    onClick={(e) => scrollTo(e, l.href)}>
                    {l.label}
                    <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
                  </motion.a>
                );
              })}
              <div className="pt-6">
                <button
                  onClick={() => { setOpen(false); onCtaClick?.(); }}
                  className="w-full font-body text-sm font-bold py-4 rounded-full"
                  style={{ backgroundColor: accentColor, color: "#0a0a0a" }}>
                  {cta}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}