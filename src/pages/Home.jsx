import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import MarqueeBanner from "../components/landing/MarqueeBanner";
import DegradingSection from "../components/landing/DegradingSection";
import SixTruthsSection from "../components/landing/SixTruthsSection";
import SessionDemoSection from "../components/landing/SessionDemoSection";
import PillarsSection from "../components/landing/PillarsSection";
import HowItFlowsSection from "../components/landing/HowItFlowsSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import PricingSection from "../components/landing/PricingSection";
import FinalCTASection from "../components/landing/FinalCTASection";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-cream min-h-screen">
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <DegradingSection />
      <SixTruthsSection />
      <SessionDemoSection />
      <PillarsSection />
      <HowItFlowsSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}