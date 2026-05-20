import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { content } = useSiteContent();
  const c = content.navbar;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (!href || href === "#") return;
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const offset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        {/* Brand */}
        <a href="#" className="font-heading text-xl font-bold tracking-widest text-off-white uppercase">
          {c.brand || "The Movement"}
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {c.links.map((l) => (
            <a key={l.label} href={l.href} onClick={(e) => scrollTo(e, l.href)} className="font-body text-sm text-white-muted hover:text-off-white transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#pricing" onClick={(e) => scrollTo(e, "#pricing")} className="font-body text-sm font-medium bg-orange-red text-dark-bg px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors">
            {c.cta}
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-dark-surface border border-dark-border text-off-white hover:border-orange-red transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile fullscreen overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden fixed inset-0 top-16 bg-dark-bg z-40 flex flex-col overflow-y-auto"
          >
            {/* Links */}
            <div className="flex-1 px-6 pt-6 pb-4 flex flex-col gap-1">
              {c.links.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                  className="flex items-center justify-between font-heading text-3xl font-bold uppercase tracking-tight text-off-white hover:text-orange-red transition-colors py-4 border-b border-dark-border"
                  onClick={(e) => scrollTo(e, l.href)}
                >
                  {l.label}
                  <ChevronRight className="w-5 h-5 text-orange-red flex-shrink-0" />
                </motion.a>
              ))}
            </div>

            {/* CTA pinned at bottom */}
            <div className="px-6 py-6 border-t border-dark-border">
              <motion.a
                href="#pricing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: c.links.length * 0.06 + 0.05, duration: 0.2 }}
                className="block font-body text-sm font-semibold bg-orange-red text-dark-bg px-5 py-4 rounded-full text-center hover:bg-orange-red-hover transition-colors"
                onClick={(e) => scrollTo(e, "#pricing")}
              >
                {c.cta}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}