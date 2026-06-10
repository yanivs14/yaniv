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

  if (!content) return null;
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

        {/* Policy links */}
        {policyLinks.length > 0 && (
          <nav className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-y-2 sm:gap-x-6">
            {policyLinks.map((p) => (
              <a
                key={p.slug}
                href={`/${p.slug}`}
                className="font-body text-xs text-white-dim hover:text-off-white transition-colors underline underline-offset-4"
              >
                {p.label}
              </a>
            ))}
          </nav>
        )}

        {/* Copyright */}
        <p className="font-body text-xs text-white-dim">{c.copyright}</p>
      </div>
    </footer>
  );
}