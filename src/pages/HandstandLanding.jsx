import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { defaultHandstandContent } from "@/lib/handstandContent";
import HandstandNavbar from "@/components/handstand/HandstandNavbar";
import HandstandHero from "@/components/handstand/HandstandHero";
import HandstandVideoSection from "@/components/handstand/HandstandVideoSection";
import HandstandMarquee from "@/components/handstand/HandstandMarquee";
import HandstandProblem from "@/components/handstand/HandstandProblem";
import HandstandSolution from "@/components/handstand/HandstandSolution";
import HandstandCurriculum from "@/components/handstand/HandstandCurriculum";
import HandstandInstructor from "@/components/handstand/HandstandInstructor";
import HandstandPricing from "@/components/handstand/HandstandPricing";
import HandstandFAQ from "@/components/handstand/HandstandFAQ";
import HandstandFinalCTA from "@/components/handstand/HandstandFinalCTA";
import HandstandPreOrder from "@/components/handstand/HandstandPreOrder";
import HandstandWhatYouGet from "@/components/handstand/HandstandWhatYouGet";
import HandstandStickyBar from "@/components/handstand/HandstandStickyBar";

const DEFAULT_PREORDER = { enabled: false, targetDate: "", price: "99", originalPrice: "149", discountText: "Save 34%", videoUrl: "", videoPoster: "" };

export default function HandstandLanding() {
  const [content, setContent] = useState(null);
  const [preOrder, setPreOrder] = useState(DEFAULT_PREORDER);
  const [preOrderRecordId, setPreOrderRecordId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Fetch landing page content
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "handstand_course" });
        if (!mounted) return;
        if (pages.length > 0 && pages[0].data) {
          setContent({ ...defaultHandstandContent, ...pages[0].data });
        } else {
          setContent(defaultHandstandContent);
        }
      } catch {
        if (mounted) setContent(defaultHandstandContent);
      }
      // Fetch pre-order config separately so one failure doesn't block the page
      try {
        const records = await base44.entities.SiteContent.filter({ section_key: "homeb_handstandPreorder" });
        if (!mounted) return;
        if (records.length > 0 && records[0].data) {
          setPreOrder({ ...DEFAULT_PREORDER, ...records[0].data });
          setPreOrderRecordId(records[0].id);
        }
      } catch {
        // Keep default (enabled: false) — regular page renders
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updatePreOrder = useCallback(async (field, value) => {
    setPreOrder((prev) => {
      const next = { ...prev, [field]: value };
      if (preOrderRecordId) {
        base44.entities.SiteContent.update(preOrderRecordId, { data: next }).catch(() => {});
      }
      return next;
    });
  }, [preOrderRecordId]);

  if (!content) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-bg">
        <div className="w-8 h-8 border-4 border-dark-border border-t-orange-red rounded-full animate-spin" />
      </div>
    );
  }

  const preOrderActive = preOrder.enabled && preOrder.targetDate && new Date(preOrder.targetDate).getTime() > Date.now();

  if (preOrderActive) {
    return <HandstandPreOrder config={preOrder} onUpdateVideo={updatePreOrder} />;
  }

  const rawAccent = content?.settings?.accentColor;
  let accentStyle = null;
  if (rawAccent) {
    const hex = rawAccent.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex;
    if (/^[0-9a-fA-F]{6}$/.test(full)) {
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      const hr = Math.round(r * 0.8), hg = Math.round(g * 0.8), hb = Math.round(b * 0.8);
      accentStyle = `#hs-root{--orange-red-rgb:${r} ${g} ${b};--orange-red-hover-rgb:${hr} ${hg} ${hb};}`;
    }
  }

  return (
    <div id="hs-root" className="min-h-screen bg-dark-bg overflow-x-hidden pb-20 lg:pb-0">
      {accentStyle && <style>{accentStyle}</style>}
      <HandstandNavbar c={content.navbar} targetDate={preOrder.targetDate} />
      <HandstandHero c={content.hero} targetDate={preOrder.targetDate} />
      <HandstandVideoSection c={content.showcase} />
      <HandstandWhatYouGet c={content.whatYouGet} />
      <HandstandMarquee />
      <HandstandProblem c={content.problem} />
      <HandstandSolution c={content.solution} />
      <HandstandCurriculum c={content.curriculum} />
      <HandstandInstructor c={content.instructor} />
      <HandstandPricing c={content.pricing} />
      <HandstandFAQ c={content.faq} />
      <HandstandFinalCTA c={content.finalCta} />
      <footer className="bg-dark-bg border-t border-dark-border py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="font-heading text-lg font-bold text-off-white uppercase mb-2">
            {content.navbar?.brandName || "Handstand"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3">
            <Link to="/privacy-policy" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">Refund Policy</Link>
            <Link to="/consumer-health-statement" className="font-body text-xs text-white-muted hover:text-orange-red transition-colors">Consumer Health Statement</Link>
          </div>
          <p className="font-body text-xs text-white-dim">
            © {new Date().getFullYear()} The Movement by Roye Gold. All rights reserved.
          </p>
        </div>
      </footer>
      <HandstandStickyBar price={content.pricing?.price} ctaText={content.pricing?.ctaText} targetDate={preOrder.targetDate} />
    </div>
  );
}