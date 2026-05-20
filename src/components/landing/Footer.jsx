import React from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  const { content } = useSiteContent();
  const c = content.footer;
  const navLinks = content.navbar?.links || [];

  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          {/* Brand + tagline */}
          <div className="flex flex-col gap-3 max-w-xs">
            <a href="#" className="font-heading text-xl font-bold tracking-widest text-off-white uppercase">
              The Movement
            </a>
            <p className="font-body text-sm text-white-muted leading-relaxed">{c.tagline}</p>
          </div>

          {/* Nav links + social */}
          <div className="flex flex-col gap-6 items-start md:items-end">
            {navLinks.length > 0 && (
              <nav className="flex flex-wrap gap-x-8 gap-y-3">
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
            <SocialLinks iconSize="w-5 h-5" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-dark-border mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white-dim">{c.copyright}</p>
        </div>
      </div>
    </footer>
  );
}