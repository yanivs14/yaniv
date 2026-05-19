import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Method", href: "#method" },
    { label: "Results", href: "#results" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-cream-dark/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <a href="#" className="font-heading text-xl font-bold tracking-tight text-warm-black">
          KINETIQO
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-body text-sm text-text-muted-warm hover:text-warm-black transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="font-body text-sm font-medium bg-warm-black text-cream px-5 py-2.5 rounded-full hover:bg-warm-black/90 transition-colors"
          >
            Start moving
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cream border-t border-cream-dark/50 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="font-body text-base text-text-muted-warm"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#pricing"
                className="font-body text-sm font-medium bg-warm-black text-cream px-5 py-3 rounded-full text-center"
                onClick={() => setOpen(false)}
              >
                Start moving
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}