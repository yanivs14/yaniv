import React from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import MarqueeBanner from "../components/landing/MarqueeBanner";
import DegradingSection from "../components/landing/DegradingSection";
import PillarsSection from "../components/landing/PillarsSection";
import HowItFlowsSection from "../components/landing/HowItFlowsSection";
import TestimonialsSection from "../components/landing/TestimonialsSection.jsx";
import AboutSection from "../components/landing/AboutSection.jsx";
import FAQSection from "../components/landing/FAQSection.jsx";
import PricingSection from "../components/landing/PricingSection";
import FinalCTASection from "../components/landing/FinalCTASection";
import Footer from "../components/landing/Footer";


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
      <DegradingSection />
      <PillarsSection />
      <HowItFlowsSection />
      <AboutSection />
      <TestimonialsSection />
      <FAQSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}