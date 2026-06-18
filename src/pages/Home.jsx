import React, { lazy, Suspense, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSiteContent } from "@/lib/SiteContentContext";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import MarqueeBanner from "../components/landing/MarqueeBanner";
import DegradingSection from "../components/landing/DegradingSection";
import PillarsSection from "../components/landing/PillarsSection";
import HowItFlowsSection from "../components/landing/HowItFlowsSection";
import PricingSection from "../components/landing/PricingSection";
import InnerCircleSection from "../components/landing/InnerCircleSection.jsx";
import BackToTop from "../components/BackToTop";
import NewsletterPopup from "../components/landing/NewsletterPopup";

const TestimonialsSection = lazy(() => import("../components/landing/TestimonialsSection.jsx"));
const AboutSection = lazy(() => import("../components/landing/AboutSection.jsx"));
const FAQSection = lazy(() => import("../components/landing/FAQSection.jsx"));
const FinalCTASection = lazy(() => import("../components/landing/FinalCTASection"));
const Footer = lazy(() => import("../components/landing/Footer"));


export default function Home() {
  const { loading, content } = useSiteContent();

  useEffect(() => {
    // Inject JSON-LD structured data for SEO
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "home-structured-data";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "The Movement by Roye Gold",
      "url": "https://themovement.royegold.com/",
      "description": "A guided daily movement practice to rebuild mobility, strength, and longevity.",
      "publisher": {
        "@type": "Person",
        "name": "Roye Gold",
        "jobTitle": "Movement Coach"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "35",
        "priceSpecification": [
          { "@type": "UnitPriceSpecification", "price": "35", "priceCurrency": "USD", "billingDuration": "P1M", "name": "Monthly Plan" },
          { "@type": "UnitPriceSpecification", "price": "250", "priceCurrency": "USD", "billingDuration": "P1Y", "name": "Annual Plan" }
        ]
      }
    });
    if (!document.getElementById("home-structured-data")) {
      document.head.appendChild(script);
    }
    return () => {
      const el = document.getElementById("home-structured-data");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      const sessionId = params.get("session_id") || "";
      base44.functions.invoke("getCheckoutSession", { session_id: sessionId })
        .then(res => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'purchase_complete',
            currency: res.data?.currency || 'USD',
            transaction_id: res.data?.transaction_id || sessionId,
            value: res.data?.value || 0,
          });
        })
        .catch(() => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'purchase_complete', currency: 'USD', transaction_id: sessionId, value: 0 });
        });
    }
  }, []);

  if (loading || !content) return null;

  return (
    <div className="bg-dark-bg min-h-screen">
      <Navbar />
      {/* #program */}
      <HeroSection />
      <PillarsSection />
      <HowItFlowsSection />
      <MarqueeBanner />
      {/* #who */}
      <DegradingSection />
      <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
        <TestimonialsSection />
      </Suspense>
      {/* #pricing */}
      <PricingSection />
      {/* #inner-circle */}
      <InnerCircleSection />
      <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
        {/* #roye */}
        <AboutSection />
        {/* #faq */}
        <FAQSection />
        <FinalCTASection />
        <Footer />
      </Suspense>
      <BackToTop />
      <NewsletterPopup />
    </div>
  );
}