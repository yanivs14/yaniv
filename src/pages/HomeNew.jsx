import React, { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteContent } from "@/lib/SiteContentContext";
import Navbar from "@/components/landing/Navbar";
import NewHero from "@/components/landing-new/NewHero";
import NewProblem from "@/components/landing-new/NewProblem";
import NewPrograms from "@/components/landing-new/NewPrograms";
import NewWhatIs from "@/components/landing-new/NewWhatIs";
import MarqueeBanner from "@/components/landing/MarqueeBanner";
import NewWhoFor from "@/components/landing-new/NewWhoFor";
import NewHowItWorks from "@/components/landing-new/NewHowItWorks";
import NewOutcome from "@/components/landing-new/NewOutcome";
import PricingSection from "@/components/landing/PricingSection";
import NewFaq from "@/components/landing-new/NewFaq";
import NewFinalCTA from "@/components/landing-new/NewFinalCTA";
import BackToTop from "@/components/BackToTop";
import NewsletterPopup from "@/components/landing/NewsletterPopup";

const AboutSection = lazy(() => import("@/components/landing/AboutSection"));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection"));
const Footer = lazy(() => import("@/components/landing/Footer"));

export default function HomeNew() {
  const { loading, content } = useSiteContent();
  if (loading || !content) return null;

  return (
    <>
      <Helmet>
        <title>The Movement by Roye Gold | Rebuild Control of Your Body</title>
        <meta name="description" content="Most pain isn't weakness — it's your joints losing control of their range. The Movement rebuilds that control from the floor up, in 10–15 minutes a day." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="bg-dark-bg min-h-screen">
        <Navbar />
        <NewHero />
        <NewProblem />
        <NewPrograms />
        <NewWhatIs />
        <MarqueeBanner />
        <NewWhoFor />
        <NewHowItWorks />
        <NewOutcome />
        <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
          <TestimonialsSection />
        </Suspense>
        <PricingSection />
        <NewFaq />
        <NewFinalCTA />
        <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
          <Footer />
        </Suspense>
        <BackToTop />
        <NewsletterPopup />
      </div>
    </>
  );
}