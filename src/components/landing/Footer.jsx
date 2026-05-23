import React from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  const { content } = useSiteContent();
  const c = content.footer;
  const navLinks = content.navbar?.links || [];

  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-10">

        {/* Brand */}
        <a href="#" className="font-heading text-2xl font-bold tracking-widest text-off-white uppercase">
          {c.brand || "The Movement"}
        </a>

        {/* Tagline */}
        {c.tagline && (
          <p className="font-body text-sm text-white-muted leading-relaxed max-w-sm">{c.tagline}</p>
        )}

        {/* Nav links */}
        {navLinks.length > 0 && (
          <nav className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-y-3 sm:gap-x-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-body text-sm text-white-muted hover:text-off-white transition-colors uppercase tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {/* Social */}
        <SocialLinks iconSize="w-5 h-5" />

        {/* Divider */}
        <div className="w-full h-px bg-dark-border" />

        {/* Copyright */}
        <p className="font-body text-xs text-white-dim">{c.copyright}</p>
      </div>
    </footer>
  );
}