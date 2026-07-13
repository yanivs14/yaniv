import React, { useEffect, useState } from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import SocialLinks from "@/components/landing/SocialLinks";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Check } from "lucide-react";

function GdprCheckbox({ checked, onChange }) {
  return (
    <div className="flex items-start gap-2.5 text-left">
      <div className="relative flex-shrink-0 mt-0.5">
        <input type="checkbox" id="footer-gdpr" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <label
          htmlFor="footer-gdpr"
          className="flex items-center justify-center w-4 h-4 rounded border cursor-pointer transition-all duration-150"
          style={{ backgroundColor: checked ? "#00fff7" : "transparent", borderColor: checked ? "#00fff7" : "#444" }}
        >
          {checked && <Check className="w-2.5 h-2.5 text-[#0a0a0a]" strokeWidth={3} />}
        </label>
      </div>
      <label htmlFor="footer-gdpr" className="font-body text-[11px] text-white-dim leading-relaxed cursor-pointer">
        I agree to the processing of my personal data in accordance with the{" "}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-white-muted hover:text-off-white transition-colors" onClick={e => e.stopPropagation()}>
          Privacy Policy
        </a>
        . You may unsubscribe at any time.
      </label>
    </div>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [gdprError, setGdprError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!gdpr) {
      setGdprError("Please agree to the Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke("subscribeNewsletter", { email: email.trim(), source: "footer" });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <p className="font-body text-sm text-orange-red font-semibold">You're in! Thanks for subscribing ✓</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          className={`flex-1 min-w-0 bg-dark-bg border rounded-full px-4 py-2.5 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${error ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-orange-red text-dark-bg rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
            : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 font-body text-center">{error}</p>}
      <GdprCheckbox checked={gdpr} onChange={v => { setGdpr(v); setGdprError(""); }} />
      {gdprError && <p className="text-xs text-red-400 font-body">{gdprError}</p>}
    </form>
  );
}

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
    base44.entities.SiteContent.filter({
      section_key: { $in: POLICY_PAGES.map(p => `policy_${p.slug}`) }
    }).then((records) => {
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
        <a href="#" className="font-heading text-2xl font-bold tracking-widest text-off-white uppercase">
          {c.brand || "The Movement"}
        </a>

        <div className="flex flex-col items-center gap-3">
          <p className="font-body text-xs text-white-dim uppercase tracking-widest">Free tips & updates</p>
          <p className="font-heading text-2xl font-bold uppercase tracking-tight text-off-white">Join The Movement</p>
          <FooterNewsletter />
        </div>

        {c.tagline && (
          <p className="font-body text-sm text-white-muted leading-relaxed max-w-sm">{c.tagline}</p>
        )}

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

        <SocialLinks iconSize="w-5 h-5" />

        <div className="w-full h-px bg-dark-border" />

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

        <p className="font-body text-xs text-white-dim">{c.copyright}</p>
      </div>
    </footer>
  );
}