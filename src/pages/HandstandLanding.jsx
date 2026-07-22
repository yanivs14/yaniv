import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { defaultHandstandContent } from "@/lib/handstandContent";
import AnnouncementBar from "@/components/handstand/AnnouncementBar";
import HandstandHero from "@/components/handstand/HandstandHero";
import ValueStrip from "@/components/handstand/ValueStrip";
import HandstandVideoSection from "@/components/handstand/HandstandVideoSection";
import HandstandProblem from "@/components/handstand/HandstandProblem";
import StartFromLevel from "@/components/handstand/StartFromLevel";
import HandstandCurriculum from "@/components/handstand/HandstandCurriculum";
import WhatIsIncluded from "@/components/handstand/WhatIsIncluded";
import HandstandInstructor from "@/components/handstand/HandstandInstructor";
import PurchaseOptions from "@/components/handstand/PurchaseOptions";
import HandstandFAQ from "@/components/handstand/HandstandFAQ";
import HandstandFinalCTA from "@/components/handstand/HandstandFinalCTA";
import HandstandStickyBar from "@/components/handstand/HandstandStickyBar";

export default function HandstandLanding() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "handstand_course" });
        if (!mounted) return;
        if (pages.length > 0 && pages[0].data) {
          const dbData = pages[0].data;
          const merged = {};
          for (const key of Object.keys(defaultHandstandContent)) {
            const defVal = defaultHandstandContent[key];
            const dbVal = dbData[key];
            if (dbVal && typeof defVal === "object" && !Array.isArray(defVal) && typeof dbVal === "object" && !Array.isArray(dbVal)) {
              merged[key] = { ...defVal, ...dbVal };
            } else {
              merged[key] = dbVal !== undefined ? dbVal : defVal;
            }
          }
          setContent(merged);
        } else {
          setContent(defaultHandstandContent);
        }
      } catch {
        if (mounted) setContent(defaultHandstandContent);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!content) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-bg">
        <div className="w-8 h-8 border-4 border-dark-border border-t-orange-red rounded-full animate-spin" />
      </div>
    );
  }

  const rawAccent = content?.settings?.accentColor;
  let accentStyle = null;
  if (rawAccent) {
    const hex = rawAccent.replace("#", "");
    const full = hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex;
    if (/^[0-9a-fA-F]{6}$/.test(full)) {
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      const hr = Math.round(r * 0.8), hg = Math.round(g * 0.8), hb = Math.round(b * 0.8);
      accentStyle = `#hs-root{--orange-red-rgb:${r} ${g} ${b};--orange-red-hover-rgb:${hr} ${hg} ${hb};}`;
    }
  }

  return (
    <div id="hs-root" className="min-h-screen bg-dark-bg overflow-x-hidden pb-16 lg:pb-0">
      <style>{`
        #hs-root {
          --c-dark-bg: 255 255 255;
          --c-dark-surface: 248 248 248;
          --c-dark-surface-2: 240 240 240;
          --c-dark-border: 229 229 229;
          --c-off-white: 26 26 26;
          --c-white-muted: 74 74 74;
          --c-white-dim: 100 100 100;
          --orange-red-rgb: 13 148 136;
          --orange-red-hover-rgb: 15 118 110;
        }
        #hs-root .text-dark-bg { color: #0F0F0F; }
        #hs-root #hero .text-off-white { color: rgb(245 245 245); }
        #hs-root #hero .text-white-muted { color: rgb(210 210 210); }
        #hs-root #hero .text-white-dim { color: rgb(170 170 170); }
        ${accentStyle || ''}
      `}</style>
      <AnnouncementBar t={content.texts} />
      <HandstandHero c={content.hero} t={content.texts} />
      <ValueStrip c={content.valueStrip} />
      <HandstandVideoSection c={content.methodVideo} t={content.texts} />
      <HandstandProblem c={content.problem} />
      <StartFromLevel c={content.startFromLevel} />
      <HandstandCurriculum c={content.curriculum} />
      <WhatIsIncluded c={content.whatIsIncluded} />
      <HandstandInstructor c={content.instructor} />
      <PurchaseOptions c={content.purchaseOptions} t={content.texts} />
      <HandstandFAQ c={content.faq} t={content.texts} />
      <HandstandFinalCTA c={content.finalCta} t={content.texts} />
      <footer id="footer" className="bg-dark-bg border-t border-dark-border py-8">
        <div className="max-w-[1250px] mx-auto px-6 lg:px-10 text-center">
          <p className="font-heading text-lg font-bold text-off-white uppercase mb-3">
            {content.footer?.brand || "The Movement by Roye Gold"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3">
            <Link to="/terms-of-use" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">{content.texts?.footerTerms}</Link>
            <Link to="/privacy-policy" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">{content.texts?.footerPrivacy}</Link>
            <Link to="/refund-policy" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">{content.texts?.footerRefund}</Link>
            <a href="mailto:support@themovement.royegold.com" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">{content.texts?.footerContact}</a>
          </div>
          <p className="font-body text-xs text-white-dim">{content.footer?.copyright}</p>
        </div>
      </footer>
      <HandstandStickyBar t={content.texts} />
    </div>
  );
}