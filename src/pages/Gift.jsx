import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";
import { track } from "@/lib/analytics";
import GiftHeader from "@/components/gift/GiftHeader";
import GiftIntro from "@/components/gift/GiftIntro";
import GiftPractice from "@/components/gift/GiftPractice";
import GiftBridge from "@/components/gift/GiftBridge";
import GiftMembership from "@/components/gift/GiftMembership";
import GiftProof from "@/components/gift/GiftProof";
import GiftStickyBar from "@/components/gift/GiftStickyBar";
import GiftFooter from "@/components/gift/GiftFooter";

export default function Gift() {
  const [content, setContent] = useState(null);
  const [showSticky, setShowSticky] = useState(false);
  const [stickyMode, setStickyMode] = useState("view");
  const practiceRef = useRef(null);
  const membershipRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "gift" });
        if (pages.length > 0 && pages[0].data) {
          const dbData = pages[0].data;
          const merged = {};
          for (const key of Object.keys(defaultGiftContent)) {
            const defVal = defaultGiftContent[key];
            const dbVal = dbData[key];
            if (dbVal && typeof defVal === "object" && !Array.isArray(defVal) && typeof dbVal === "object" && !Array.isArray(dbVal)) {
              merged[key] = { ...defVal, ...dbVal };
            } else {
              merged[key] = dbVal !== undefined ? dbVal : defVal;
            }
          }
          setContent(merged);
        } else {
          setContent(defaultGiftContent);
        }
      } catch {
        setContent(defaultGiftContent);
      }
    })();
  }, []);

  useEffect(() => {
    track("movement_reset_access_view");
  }, []);

  useEffect(() => {
    if (!content) return;
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
  }, [content]);

  const handlePracticeComplete = () => {
    setShowSticky(true);
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
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