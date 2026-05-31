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
  const { loading, content } = useSiteContent();

  if (loading || !content) return null;

  return (
    <div className="bg-dark-bg min-h-screen">
      <Navbar />
      <HeroSection />
      <PillarsSection />
      <HowItFlowsSection />
      <DegradingSection />
      <MarqueeBanner />
      <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
        <TestimonialsSection />
        <AboutSection />
        <PricingSection />
        <InnerCircleSection />
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </Suspense>
      <BackToTop />
    </div>
  );
}