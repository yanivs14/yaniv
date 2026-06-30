import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { defaultHandstandContent } from "@/lib/handstandContent";
import HandstandNavbar from "@/components/handstand/HandstandNavbar";
import HandstandHero from "@/components/handstand/HandstandHero";
import HandstandProblem from "@/components/handstand/HandstandProblem";
import HandstandSolution from "@/components/handstand/HandstandSolution";
import HandstandCurriculum from "@/components/handstand/HandstandCurriculum";
import HandstandInstructor from "@/components/handstand/HandstandInstructor";
import HandstandTestimonials from "@/components/handstand/HandstandTestimonials";
import HandstandPricing from "@/components/handstand/HandstandPricing";
import HandstandFAQ from "@/components/handstand/HandstandFAQ";
import HandstandFinalCTA from "@/components/handstand/HandstandFinalCTA";

export default function HandstandLanding() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({
          page_key: "handstand_course",
        });
        if (pages.length > 0 && pages[0].data) {
          setContent({ ...defaultHandstandContent, ...pages[0].data });
        } else {
          setContent(defaultHandstandContent);
        }
      } catch {
        setContent(defaultHandstandContent);
      }
    })();
  }, []);

  if (!content) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-bg">
        <div className="w-8 h-8 border-4 border-dark-border border-t-orange-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <HandstandNavbar c={content.navbar} />
      <HandstandHero c={content.hero} />
      <HandstandProblem c={content.problem} />
      <HandstandSolution c={content.solution} />
      <HandstandCurriculum c={content.curriculum} />
      <HandstandInstructor c={content.instructor} />
      <HandstandTestimonials c={content.testimonials} />
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