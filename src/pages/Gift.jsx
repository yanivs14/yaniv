import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";
import GdprConsent from "@/components/landing/GdprConsent";
import { track, trackLeadCapture } from "@/lib/analytics";
import GiftHeader from "@/components/gift/GiftHeader";
import GiftIntro from "@/components/gift/GiftIntro";
import GiftPractice from "@/components/gift/GiftPractice";
import GiftBridge from "@/components/gift/GiftBridge";
import GiftMembership from "@/components/gift/GiftMembership";
import GiftProof from "@/components/gift/GiftProof";
import GiftStickyBar from "@/components/gift/GiftStickyBar";
import GiftFooter from "@/components/gift/GiftFooter";

const STORAGE_KEY = "gift_unlocked_until";
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

export default function Gift() {
  const [content, setContent] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // sticky bar state
  const [showSticky, setShowSticky] = useState(false);
  const [stickyMode, setStickyMode] = useState("view"); // "view" | "annual"
  const practiceRef = useRef(null);
  const membershipRef = useRef(null);

  useEffect(() => {
    setUnlocked(isUnlocked());
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

  // Track access view once unlocked
  useEffect(() => {
    if (unlocked) track("movement_reset_access_view");
  }, [unlocked]);

  // Sticky bar: show after scrolled past practice OR completed; switch to annual at membership
  useEffect(() => {
    if (!unlocked) return;
    const practice = practiceRef.current;
    const membership = membershipRef.current;

    const onScroll = () => {
      if (practice) {
        const rect = practice.getBoundingClientRect();
        if (rect.bottom < window.innerHeight * 0.5) {
          setShowSticky(true);
        }
      }
      if (membership) {
        const rect = membership.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.6) {
          setStickyMode("annual");
        } else {
          setStickyMode("view");
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [unlocked]);

  const handlePracticeComplete = () => {
    setShowSticky(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!gdpr) {
      setError("Please accept the privacy policy to continue");
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke("subscribeNewsletter", { email: email.trim(), source: "gift_page" });
      trackLeadCapture(email.trim(), "gift_page", gdpr, "");
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

  // Gate screen (first visit)
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Your Free Movement Reset — Roye Gold</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          {gate.eyebrow && (
            <p className="font-body text-[11px] text-orange-red uppercase tracking-widest mb-3">{gate.eyebrow}</p>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight mb-3 leading-tight">
            {gate.headline}
          </h1>
          <p className="font-body text-sm text-white-muted mb-7 leading-relaxed">{gate.subheadline}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              className={`w-full bg-dark-surface border rounded-xl px-5 py-3.5 font-body text-sm text-off-white placeholder-white-dim focus:outline-none transition-colors ${error ? "border-red-500" : "border-dark-border focus:border-orange-red"}`}
            />
            {error && <p className="text-xs text-red-400 font-body">{error}</p>}
            <GdprConsent id="gift-gdpr" checked={gdpr} onChange={(v) => { setGdpr(v); setError(""); }} />
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
          </form>
          {gate.footnote && <p className="mt-4 text-center font-body text-xs text-white-dim">{gate.footnote}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Your Free Movement Reset — Roye Gold</title>
      </Helmet>

      <GiftHeader c={content.header} />

      <main className="pb-16 lg:pb-0">
        <GiftIntro c={content.stage1} />

        <div ref={practiceRef}>
          <GiftPractice c={content.stage2} onComplete={handlePracticeComplete} />
        </div>

        <GiftBridge c={content.stage3} />

        <div ref={membershipRef}>
          <GiftMembership c={content.stage4} />
        </div>

        <GiftProof c={content.stage5} />
      </main>

      <GiftFooter c={content.footer} />

      <GiftStickyBar
        visible={showSticky}
        mode={stickyMode}
        annualCta={content.stage4?.annual?.cta}
      />
    </div>
  );
}