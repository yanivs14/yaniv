import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const DISPOSABLE = ["mailinator.com","tempmail.com","10minutemail.com","guerrillamail.com","yopmail.com","throwawaymail.com","trashmail.com","getnada.com","maildrop.cc"];
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function GiftGate({ c, onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");

  const validate = (value) => {
    const t = value.trim();
    if (!t) return "Please enter your email";
    if (!EMAIL_RE.test(t)) return "Please enter a valid email address";
    if (DISPOSABLE.includes(t.split("@")[1].toLowerCase())) return "Temporary email addresses are not accepted";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate(email);
    if (err) { setError(err); return; }
    if (!privacy) { setError("Please accept the privacy policy to continue"); return; }
    setError("");
    onSubmit(email.trim(), marketing);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-dark-border bg-dark-surface">
        {/* Visual */}
        <div className="relative min-h-[200px] md:min-h-full bg-dark-bg overflow-hidden">
          {c.gateImage ? (
            <img src={c.gateImage} alt="Roye Gold" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface-2" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-dark-bg/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <p className="font-body text-[11px] text-orange-red uppercase tracking-widest font-semibold mb-2">{c.eyebrow}</p>
            <p className="font-body text-sm text-off-white/90 leading-relaxed">{c.benefitLine}</p>
          </div>
        </div>
        {/* Form */}
        <div className="p-6 lg:p-10 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight mb-3 leading-[1.05]">
              {c.headline}
            </h1>
            <p className="font-body text-sm lg:text-[15px] text-white-muted leading-relaxed mb-6">{c.subheadline}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={c.emailPlaceholder}
                className="w-full bg-dark-bg border rounded-xl px-5 py-3.5 font-body text-sm text-off-white placeholder-white-dim focus:outline-none focus:ring-2 focus:ring-orange-red/40 transition-all"
                style={{ borderColor: error ? "#ef4444" : undefined }}
              />
              {error && <p className="text-xs text-red-400 font-body">{error}</p>}
              {/* Privacy (required) */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={privacy} onChange={(e) => { setPrivacy(e.target.checked); setError(""); }} className="sr-only" />
                <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all" style={{ backgroundColor: privacy ? "#00fff7" : "transparent", borderColor: privacy ? "#00fff7" : "#444" }}>
                  {privacy && <Check className="w-2.5 h-2.5 text-[#0a0a0a]" strokeWidth={3} />}
                </span>
                <span className="font-body text-[11px] text-white-muted leading-relaxed">
                  I agree to the processing of my personal data in accordance with the{" "}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-off-white hover:text-orange-red transition-colors" onClick={(e) => e.stopPropagation()}>privacy policy</a>.
                </span>
              </label>
              {/* Marketing (optional) */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="sr-only" />
                <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all" style={{ backgroundColor: marketing ? "#00fff7" : "transparent", borderColor: marketing ? "#00fff7" : "#444" }}>
                  {marketing && <Check className="w-2.5 h-2.5 text-[#0a0a0a]" strokeWidth={3} />}
                </span>
                <span className="font-body text-[11px] text-white-dim leading-relaxed">{c.marketingLabel}</span>
              </label>
              <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60 mt-1 focus:outline-none focus:ring-4 focus:ring-orange-red/30">
                {loading ? <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" /> : <>{c.ctaText} <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-center font-body text-xs text-white-dim mt-1">{c.microcopy}</p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}