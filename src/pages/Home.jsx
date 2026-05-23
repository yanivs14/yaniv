import React, { lazy, Suspense } from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import MarqueeBanner from "../components/landing/MarqueeBanner";
import DegradingSection from "../components/landing/DegradingSection";
import PillarsSection from "../components/landing/PillarsSection";
import HowItFlowsSection from "../components/landing/HowItFlowsSection";
import BackToTop from "../components/BackToTop";

const TestimonialsSection = lazy(() => import("../components/landing/TestimonialsSection.jsx"));
const AboutSection = lazy(() => import("../components/landing/AboutSection.jsx"));
const FAQSection = lazy(() => import("../components/landing/FAQSection.jsx"));
const PricingSection = lazy(() => import("../components/landing/PricingSection"));
const InnerCircleSection = lazy(() => import("../components/landing/InnerCircleSection.jsx"));
const FinalCTASection = lazy(() => import("../components/landing/FinalCTASection"));
const Footer = lazy(() => import("../components/landing/Footer"));


export default function Home() {
  const { loading } = useSiteContent();

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-dark-border border-t-orange-red rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-dark-bg min-h-screen">
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <HowItFlowsSection />
      <DegradingSection />
      <PillarsSection />
      <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
        <AboutSection />
        <TestimonialsSection />
        <FAQSection />
        <PricingSection />
        <InnerCircleSection />
        <FinalCTASection />
        <Footer />
      </Suspense>
      <BackToTop />
    </div>
  );
}