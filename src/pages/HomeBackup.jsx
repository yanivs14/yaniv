import React, { lazy, Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useSiteContent } from "@/lib/SiteContentContext";
import { trackPurchase } from "@/lib/analytics";
import Navbar from "../components/homeb/Navbar";
import HeroSection from "../components/homeb/HeroSection";
import PricingSection from "../components/homeb/PricingSection";
import BackToTop from "../components/homeb/BackToTop";
import NewsletterPopup from "../components/homeb/NewsletterPopup";
import SocialProofSection from "../components/homeb/SocialProofSection";
import BenefitsSection from "../components/homeb/BenefitsSection";
import SeeInsideSection from "../components/homeb/SeeInsideSection";
import ComparisonSection from "../components/homeb/ComparisonSection";
import DegradingSection from "../components/homeb/DegradingSection";

const TestimonialsSection = lazy(() => import("../components/homeb/TestimonialsSection.jsx"));
const AboutSection = lazy(() => import("../components/homeb/AboutSection.jsx"));
const FAQSection = lazy(() => import("../components/homeb/FAQSection.jsx"));
const FinalCTASection = lazy(() => import("../components/homeb/FinalCTASection"));
const Footer = lazy(() => import("../components/homeb/Footer"));


export default function HomeBackup() {
  const { loading, content } = useSiteContent();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      const sessionId = params.get("session_id") || "";
      base44.functions.invoke("getCheckoutSession", { session_id: sessionId })
        .then(res => {
          trackPurchase(
            res.data?.transaction_id || sessionId,
            res.data?.value || 0,
            res.data?.currency || 'USD',
            'unknown',
            res.data?.customer_email,
            res.data?.customer_name
          );
        })
        .catch(() => {
          trackPurchase(sessionId, 0, 'USD', 'unknown', '', '');
        });
    }
  }, []);

  if (loading || !content) return null;

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Movement by Roye Gold",
    "url": "https://themovement.royegold.com/",
    "description": "A guided daily movement practice to rebuild mobility, strength, and longevity.",
    "publisher": { "@type": "Person", "name": "Roye Gold", "jobTitle": "Movement Coach" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "priceSpecification": [
        { "@type": "UnitPriceSpecification", "price": "35", "priceCurrency": "USD", "billingDuration": "P1M", "name": "Monthly Plan" },
        { "@type": "UnitPriceSpecification", "price": "250", "priceCurrency": "USD", "billingDuration": "P1Y", "name": "Annual Plan" }
      ]
    }
  });

  return (
    <>
    <Helmet>
      <title>The Movement by Roye Gold | Daily Movement Practice for Mobility & Strength</title>
      <meta name="description" content="A guided daily movement practice to rebuild mobility, strength, and longevity. Personalized adaptive training — no equipment needed. Join The Movement by Roye Gold." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://royegold.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="The Movement by Roye Gold" />
      <meta property="og:title" content="The Movement by Roye Gold | Daily Movement Practice for Mobility & Strength" />
      <meta property="og:description" content="A guided daily movement practice to rebuild mobility, strength, and longevity. Personalized adaptive training — no equipment needed." />
      <meta property="og:url" content="https://royegold.com/" />
      <meta property="og:image" content="https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="The Movement by Roye Gold | Daily Movement Practice for Mobility & Strength" />
      <meta name="twitter:description" content="A guided daily movement practice to rebuild mobility, strength, and longevity. Personalized adaptive training — no equipment needed." />
      <meta name="twitter:image" content="https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png" />
      <script type="application/ld+json">{structuredData}</script>
    </Helmet>
    <div className="bg-dark-bg min-h-screen">
      <Navbar />
      {/* #program */}
      <HeroSection />
      <SocialProofSection />
      <BenefitsSection />
      <SeeInsideSection />
      {/* #pricing */}
      <PricingSection />
      <DegradingSection />
      <Suspense fallback={<div className="h-64 bg-dark-bg" />}>
        <TestimonialsSection />
      </Suspense>
      <ComparisonSection />
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
    </>
  );
}