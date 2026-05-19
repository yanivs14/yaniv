import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { content } = useSiteContent();
  const c = content.navbar;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <a href="#" className="font-heading text-xl font-bold tracking-widest text-off-white uppercase">
          {c.brand}
        </a>

        <div className="hidden md:flex items-center gap-8">
          {c.links.map((l) => (
            <a key={l.label} href={l.href} className="font-body text-sm text-white-muted hover:text-off-white transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#pricing" className="font-body text-sm font-medium bg-orange-red text-dark-bg px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors">
            {c.cta}
          </a>
        </div>

        <button className="md:hidden text-off-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-surface border-t border-dark-border overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {c.links.map((l) => (
                <a key={l.label} href={l.href} className="font-body text-base text-white-muted" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <a href="#pricing" className="font-body text-sm font-medium bg-orange-red text-dark-bg px-5 py-3 rounded-full text-center" onClick={() => setOpen(false)}>
                {c.cta}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}