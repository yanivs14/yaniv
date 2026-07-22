import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";
import { track, trackLeadCapture } from "@/lib/analytics";
import GiftHeader from "@/components/gift/GiftHeader";
import GiftIntro from "@/components/gift/GiftIntro";
import GiftPractice from "@/components/gift/GiftPractice";
import GiftPostPractice from "@/components/gift/GiftPostPractice";
import GiftBridge from "@/components/gift/GiftBridge";
import GiftMembership from "@/components/gift/GiftMembership";
import GiftProof from "@/components/gift/GiftProof";
import GiftStickyBar from "@/components/gift/GiftStickyBar";
import GiftFooter from "@/components/gift/GiftFooter";

const STORAGE_KEY = "gift_unlocked_until";
const EMAIL_KEY = "gift_email";
const SOURCE_KEY = "gift_source";
const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "tempmail.com", "tempmail.io", "10minutemail.com", "guerrillamail.com",
  "yopmail.com", "throwawaymail.com", "trashmail.com", "getnada.com", "maildrop.cc",
  "dispostable.com", "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com", "tmpmail.org",
  "temp-mail.org", "mintemail.com", "mohmal.com", "emailondeck.com", "spambog.com",
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address";
  const domain = trimmed.split("@")[1].toLowerCase();
  const tld = domain.split(".").pop();
  if (tld.length < 2) return "Please enter a valid email address";
  if (DISPOSABLE_DOMAINS.includes(domain)) return "Temporary email addresses are not accepted";
  return null;
}

function isUnlocked() {
  const until = localStorage.getItem(STORAGE_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

function unlock() {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + ONE_MONTH));
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("source") || params.get("utm_source");
  if (source) localStorage.setItem(SOURCE_KEY, source);
  const mcAccess = params.get("mc") === "1" || params.get("access") === "granted";
  return mcAccess;
}

export default function Gift() {
  const [content, setContent] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const postPracticeRef = useRef(null);

  useEffect(() => {
    const mcAccess = captureAttribution();
    if (mcAccess) {
      unlock();
      setUnlocked(true);
    } else {
      setUnlocked(isUnlocked());
    }
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "gift" });
        if (pages.length > 0 && pages[0].data) {
          setContent({ ...defaultGiftContent, ...pages[0].data });
        } else {
          setContent(defaultGiftContent);
        }
      } catch {
        setContent(defaultGiftContent);
      }
    })();
  }, []);

  useEffect(() => {
    if (content && !unlocked) track("gift_gate_viewed");
    if (unlocked) track("gift_access_granted");
  }, [unlocked, content]);

  // Show sticky when post-practice section is reached (fallback if video tracking misses)
  useEffect(() => {
    if (!unlocked) return;
    const el = postPracticeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShowSticky(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [unlocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    setLoading(true);
    try {
      const source = localStorage.getItem(SOURCE_KEY) || "";
      await base44.functions.invoke("subscribeNewsletter", {
        email: email.trim(),
        source: "gift_page",
        attribution_source: source,
        marketing_opt_in: marketingOptIn,
      });
      track("gift_email_submitted", { source, marketing_opt_in: marketingOptIn });
      if (marketingOptIn) track("gift_marketing_opt_in");
      track("gift_access_granted");
      trackLeadCapture(email.trim(), "gift_page", marketingOptIn, source);
      localStorage.setItem(EMAIL_KEY, email.trim());
      unlock();
      setUnlocked(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const gate = content.gate;

  const SEO_TITLE = "Free 5-Minute Movement Reset | Roye Gold";
  const SEO_DESC = "Unlock a free guided practice combining mobility, strength, and control with Roye Gold. Five minutes, no equipment required.";

  // Gate screen
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6 py-12">
        <Helmet>
          <title>{SEO_TITLE}</title>
          <meta name="description" content={SEO_DESC} />
          <meta property="og:title" content={SEO_TITLE} />
          <meta property="og:description" content={SEO_DESC} />
          <meta property="og:type" content="website" />
        </Helmet>
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Gate image */}
          {gate.gateImage && (
            <div className="hidden md:block">
              <img src={gate.gateImage} alt="Roye Gold" className="rounded-2xl w-full object-cover" />
            </div>
          )}
          {/* Gate form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={gate.gateImage ? "text-center md:text-left" : "w-full max-w-md mx-auto text-center"}
          >
            {gate.eyebrow && (
              <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{gate.eyebrow}</p>
            )}
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-3 leading-tight">
              {gate.headline}
            </h1>
            <p className="font-body text-sm text-white-muted mb-4 leading-relaxed">{gate.subheadline}</p>
            {gate.benefitLine && (
              <p className="font-heading text-sm font-semibold text-off-white mb-6">{gate.benefitLine}</p>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={gate.emailPlaceholder || "Enter your email address"}
                className={`w-full bg-dark-surface border rounded-xl px-5 py-3.5 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${error ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
              />
              {error && <p className="text-xs text-red-400 font-body">{error}</p>}
              {/* Marketing opt-in (unchecked, optional) */}
              <label htmlFor="gift-marketing" className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    id="gift-marketing"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded border transition-all"
                    style={{ backgroundColor: marketingOptIn ? "#00fff7" : "transparent", borderColor: marketingOptIn ? "#00fff7" : "#444" }}
                  >
                    {marketingOptIn && <Check className="w-2.5 h-2.5 text-dark-bg" strokeWidth={3} />}
                  </span>
                </div>
                <span className="font-body text-[11px] text-white-dim leading-relaxed">
                  {gate.marketingOptIn || "Yes, send me movement guidance, new practices, and membership updates from Roye Gold."}
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-orange-red text-dark-bg font-body text-sm font-semibold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>{gate.ctaText} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="font-body text-[11px] text-white-dim text-center mt-1">
                {gate.microcopy}
              </p>
              <p className="font-body text-[11px] text-white-dim text-center">
                By continuing, you agree to our{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-white-muted hover:text-off-white transition-colors">Privacy Policy</a>
                .
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:type" content="website" />
      </Helmet>

      <GiftHeader c={content.header} />

      <main className="pb-16 lg:pb-0">
        <GiftIntro c={content.stage1} />

        <GiftPractice c={content.stage2} onPracticeStart={() => setShowSticky(true)} />

        <div ref={postPracticeRef}>
          <GiftPostPractice c={content.stage3} />
        </div>

        <GiftBridge c={content.stage4} />

        <GiftMembership c={content.stage5} />

        <GiftProof c={content.stage6} />
      </main>

      <GiftFooter c={content.footer} />

      <GiftStickyBar visible={showSticky} />
    </div>
  );
}