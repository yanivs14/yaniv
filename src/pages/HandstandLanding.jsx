import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { defaultHandstandContent } from "@/lib/handstandContent";
import HandstandNavbar from "@/components/handstand/HandstandNavbar";
import HandstandHero from "@/components/handstand/HandstandHero";
import HandstandMarquee from "@/components/handstand/HandstandMarquee";
import HandstandProblem from "@/components/handstand/HandstandProblem";
import HandstandSolution from "@/components/handstand/HandstandSolution";
import HandstandCurriculum from "@/components/handstand/HandstandCurriculum";
import HandstandInstructor from "@/components/handstand/HandstandInstructor";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import HandstandPricing from "@/components/handstand/HandstandPricing";
import HandstandFAQ from "@/components/handstand/HandstandFAQ";
import HandstandFinalCTA from "@/components/handstand/HandstandFinalCTA";
import HandstandPreOrder from "@/components/handstand/HandstandPreOrder";

const DEFAULT_PREORDER = { enabled: false, targetDate: "", price: "99", originalPrice: "149", discountText: "Save 34%" };

export default function HandstandLanding() {
  const [content, setContent] = useState(null);
  const [preOrder, setPreOrder] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [pages, preOrderRecords] = await Promise.all([
          base44.entities.LandingPageContent.filter({ page_key: "handstand_course" }),
          base44.entities.SiteContent.filter({ section_key: "homeb_handstandPreorder" }),
        ]);
        if (pages.length > 0 && pages[0].data) {
          setContent({ ...defaultHandstandContent, ...pages[0].data });
        } else {
          setContent(defaultHandstandContent);
        }
        if (preOrderRecords.length > 0 && preOrderRecords[0].data) {
          setPreOrder({ ...DEFAULT_PREORDER, ...preOrderRecords[0].data });
        } else {
          setPreOrder(DEFAULT_PREORDER);
        }
      } catch {
        setContent(defaultHandstandContent);
        setPreOrder(DEFAULT_PREORDER);
      }
    })();
  }, []);

  if (!content || !preOrder) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-bg">
        <div className="w-8 h-8 border-4 border-dark-border border-t-orange-red rounded-full animate-spin" />
      </div>
    );
  }

  const preOrderActive = preOrder.enabled && preOrder.targetDate && new Date(preOrder.targetDate).getTime() > Date.now();

  if (preOrderActive) {
    return <HandstandPreOrder config={preOrder} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg overflow-x-hidden">
      <HandstandNavbar c={content.navbar} />
      <HandstandHero c={content.hero} />
      <HandstandMarquee />
      <HandstandProblem c={content.problem} />
      <HandstandSolution c={content.solution} />
      <HandstandCurriculum c={content.curriculum} />
      <HandstandInstructor c={content.instructor} />
      <TestimonialsSection />
      <HandstandPricing c={content.pricing} />
      <HandstandFAQ c={content.faq} />
      <HandstandFinalCTA c={content.finalCta} />
      <footer className="bg-dark-bg border-t border-dark-border py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <p className="font-heading text-lg font-bold text-off-white uppercase mb-2">
            {content.navbar?.brandName || "Handstand"}
          </p>
          <p className="font-body text-xs text-white-dim">
            © {new Date().getFullYear()} The Movement by Roye Gold. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}