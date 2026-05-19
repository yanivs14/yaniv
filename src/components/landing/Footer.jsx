import React from "react";
import { useSiteContent } from "@/lib/SiteContentContext";

export default function Footer() {
  const { content } = useSiteContent();
  const c = content.footer;

  return (
    <footer className="bg-dark-surface border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-heading text-4xl lg:text-6xl font-bold tracking-widest text-off-white uppercase">{c.brand}</p>
          <div className="text-center md:text-right">
            <p className="font-body text-sm text-white-muted">{c.tagline}</p>
            <p className="font-body text-xs text-white-dim mt-1">{c.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}