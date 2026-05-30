import React, { useEffect, useState } from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import SocialLinks from "./SocialLinks";
import { base44 } from "@/api/base44Client";

const POLICY_PAGES = [
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-of-use", label: "Terms of Use" },
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "accessibility-statement", label: "Accessibility Statement" },
  { slug: "consumer-health-statement", label: "Consumer Health Statement" },
];

export default function Footer() {
  const { content } = useSiteContent();
  const c = content.footer;
  const navLinks = content.navbar?.links || [];
  const [policyLinks, setPolicyLinks] = useState([]);

  useEffect(() => {
    base44.entities.SiteContent.list().then((records) => {
      const active = POLICY_PAGES.filter(p => {
        const rec = records.find(r => r.section_key === `policy_${p.slug}`);
        return rec?.data?.body?.trim();
      });
      setPolicyLinks(active);
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-dark-bg border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-14">
          {/* Brand + tagline */}
          <div className="max-w-sm">
            <a href="#" className="font-heading text-2xl font-bold tracking-widest text-off-white uppercase">
              {c.brand || "The Movement"}
            </a>
            {c.tagline && (
              <p className="font-body text-sm text-white-muted leading-relaxed mt-3">{c.tagline}</p>
            )}
          </div>

          {/* Nav links */}
          {navLinks.length > 0 && (
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="font-body text-sm text-white-muted hover:text-orange-red transition-colors uppercase tracking-wide"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}

          {/* Social */}
          <SocialLinks iconSize="w-5 h-5" />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-dark-border mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-body text-xs text-white-dim">{c.copyright}</p>

          {policyLinks.length > 0 && (
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {policyLinks.map((p) => (
                <a
                  key={p.slug}
                  href={`/${p.slug}`}
                  className="font-body text-xs text-white-dim hover:text-white-muted transition-colors"
                >
                  {p.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}