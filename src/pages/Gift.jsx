import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";
import { track, trackLeadCapture } from "@/lib/analytics";
import GiftGate from "@/components/gift/GiftGate";
import GiftHeader from "@/components/gift/GiftHeader";
import GiftHero from "@/components/gift/GiftHero";
import GiftIntroVideo from "@/components/gift/GiftIntroVideo";
import GiftPrep from "@/components/gift/GiftPrep";
import GiftPractice from "@/components/gift/GiftPractice";
import GiftClosing from "@/components/gift/GiftClosing";
import GiftBridge from "@/components/gift/GiftBridge";
import GiftTestimonial from "@/components/gift/GiftTestimonial";
import GiftMembership from "@/components/gift/GiftMembership";
import GiftProof from "@/components/gift/GiftProof";
import GiftFinalCTA from "@/components/gift/GiftFinalCTA";
import GiftStickyBar from "@/components/gift/GiftStickyBar";
import GiftFooter from "@/components/gift/GiftFooter";

const STORAGE_KEY = "gift_unlocked_until";
const EMAIL_KEY = "gift_email";
const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

function isUnlocked() {
  const until = localStorage.getItem(STORAGE_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}
function unlock() {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + ONE_MONTH));
}
function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY) || "";
}
function storeEmail(email) {
  if (email) localStorage.setItem(EMAIL_KEY, email);
}

export default function Gift() {
  const [content, setContent] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [gateLoading, setGateLoading] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [inCheckout, setInCheckout] = useState(false);
  const practiceRef = useRef(null);
  const closingRef = useRef(null);

  // Load content + check token/localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    (async () => {
      // Load content
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

      // Check token from URL (ManyChat or return-link)
      if (token) {
        try {
          const res = await base44.functions.invoke("manageGiftAccess", { action: "verify", token });
          if (res.data?.valid && res.data.email) {
            unlock();
            storeEmail(res.data.email);
            setEmail(res.data.email);
            setUnlocked(true);
            track("gift_unlocked_via_token", { source: "token" });
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        } catch (e) {
          console.warn("Token verification failed:", e.message);
        }
      }

      // Check localStorage
      if (isUnlocked()) {
        setEmail(getStoredEmail());
        setUnlocked(true);
      }
    })();
  }, []);

  // Track access view
  useEffect(() => {
    if (unlocked) track("gift_access_view");
  }, [unlocked]);

  // Sticky bar: show after practice video starts OR closing section reached
  const handlePracticeStarted = () => {
    setShowSticky(true);
  };

  useEffect(() => {
    if (!unlocked) return;
    const closing = closingRef.current;
    if (!closing) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setShowSticky(true);
    }, { threshold: 0.3 });
    obs.observe(closing);
    return () => obs.disconnect();
  }, [unlocked]);

  // Handle email gate submission
  const handleGateSubmit = async (emailValue, marketing) => {
    setGateLoading(true);
    try {
      // Subscribe to newsletter (handles Kit sync)
      await base44.functions.invoke("subscribeNewsletter", { email: emailValue, source: "gift_page" });
      // Create token + send return-link email
      await base44.functions.invoke("manageGiftAccess", { action: "create", email: emailValue, source: "gift_page" });
      trackLeadCapture(emailValue, "gift_page", marketing, "");
      track("gift_email_submitted", { marketing_consent: marketing ? "true" : "false" });
      unlock();
      storeEmail(emailValue);
      setEmail(emailValue);
      setUnlocked(true);
    } catch (e) {
      console.warn("Gate submission error:", e.message);
    }
    setGateLoading(false);
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Gate screen
  if (!unlocked) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Your Free Movement Reset — Roye Gold</title>
        </Helmet>
        <GiftGate c={content.gate} onSubmit={handleGateSubmit} loading={gateLoading} />
      </>
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
        <GiftHero c={content.hero} />
        <GiftIntroVideo c={content.introVideo} />
        <GiftPrep c={content.prep} />
        <div ref={practiceRef}>
          <GiftPractice c={content.practice} onVideoStarted={handlePracticeStarted} />
        </div>
        <div ref={closingRef}>
          <GiftClosing c={content.closing} />
        </div>
        <GiftBridge c={content.bridge} />
        <GiftTestimonial c={content.primaryTestimonial} />
        <GiftMembership c={content.membership} email={email} onCheckoutStart={() => setInCheckout(true)} />
        <GiftProof c={{ testimonials: content.testimonials, faq: content.faq }} />
        <GiftFinalCTA c={content.final} email={email} onCheckoutStart={() => setInCheckout(true)} />
      </main>
      <GiftFooter c={content.footer} />
      <GiftStickyBar c={content.stickyBar} visible={showSticky} inCheckout={inCheckout} />
    </div>
  );
}