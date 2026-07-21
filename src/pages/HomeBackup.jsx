import React, { lazy, Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { base44 } from "@/api/base44Client";
import { useSiteContent } from "@/lib/SiteContentContext";
import { trackPurchase } from "@/lib/analytics";
import Navbar from "../components/homeb/Navbar";
import HeroSection from "../components/homeb/HeroSection";
import BackToTop from "../components/homeb/BackToTop";
import NewsletterPopup from "../components/homeb/NewsletterPopup";

const SocialProofSection = lazy(() => import("../components/homeb/SocialProofSection"));
const BenefitsSection = lazy(() => import("../components/homeb/BenefitsSection"));
const SeeInsideSection = lazy(() => import("../components/homeb/SeeInsideSection"));
const PricingSection = lazy(() => import("../components/homeb/PricingSection"));
const DegradingSection = lazy(() => import("../components/homeb/DegradingSection"));
const TestimonialsSection = lazy(() => import("../components/homeb/TestimonialsSection"));
const ComparisonSection = lazy(() => import("../components/homeb/ComparisonSection"));
const AboutSection = lazy(() => import("../components/homeb/AboutSection"));
const FAQSection = lazy(() => import("../components/homeb/FAQSection"));
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

  // Auto-scroll to anchor (#pricing, #faq, etc.) once content has mounted
  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    let attempts = 0;
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts++ < 25) {
        setTimeout(tryScroll, 100);
      }
    };
    const t = setTimeout(tryScroll, 100);
    return () => { cancelled = true; clearTimeout(t); };
  }, [loading]);

  if (loading || !content) return null;

  const ogImage = "https://media.base44.com/images/public/6a0c583766eb003a373061f3/a16cf5928_generated_acb3ceec.png";

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Movement by Roye Gold",
    "url": "https://royegold.com/",
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

  const faqData = content?.faq?.items?.filter(q => q.question && q.answer).map(q => ({
    "@type": "Question",
    "name": q.question,
    "acceptedAnswer": { "@type": "Answer", "text": q.answer }
  })) || [];

  const faqStructuredData = faqData.length > 0 ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData
  }) : null;

  return (
    <>
    <Helmet>
      <title>The Movement by Roye Gold | Daily Movement Practice for Mobility & Strength</title>
      <meta name="description" content="A guided daily movement practice to rebuild mobility, strength, and longevity. Personalized adaptive training — no equipment needed. Join The Movement by Roye Gold." />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Roye Gold" />
      <link rel="canonical" href="https://royegold.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="The Movement by Roye Gold" />
      <meta property="og:title" content="The Movement by Roye Gold | Daily Movement Practice for Mobility & Strength" />
      <meta property="og:description" content="A guided daily movement practice to rebuild mobility, strength, and longevity. Personalized adaptive training — no equipment needed." />
      <meta property="og:url" content="https://royegold.com/" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="The Movement by Roye Gold — Daily Movement Practice" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="The Movement by Roye Gold | Daily Movement Practice for Mobility & Strength" />
      <meta name="twitter:description" content="A guided daily movement practice to rebuild mobility, strength, and longevity. Personalized adaptive training — no equipment needed." />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="The Movement by Roye Gold — Daily Movement Practice" />
      <script type="application/ld+json">{structuredData}</script>
      {faqStructuredData && <script type="application/ld+json">{faqStructuredData}</script>}
    </Helmet>
    <div className="bg-dark-bg min-h-screen">
      <Navbar />
      {/* #program */}
      <HeroSection />
      <Suspense fallback={<div className="h-32 bg-dark-bg" />}><SocialProofSection /></Suspense>
      <Suspense fallback={<div className="h-96 bg-dark-bg" />}><BenefitsSection /></Suspense>
      <Suspense fallback={<div className="h-96 bg-dark-bg" />}><SeeInsideSection /></Suspense>
      {/* #pricing */}
      <Suspense fallback={<div className="h-[600px] bg-dark-bg" />}><PricingSection /></Suspense>
      <Suspense fallback={<div className="h-96 bg-dark-bg" />}><DegradingSection /></Suspense>
      <Suspense fallback={<div className="h-96 bg-dark-bg" />}><TestimonialsSection /></Suspense>
      <Suspense fallback={<div className="h-96 bg-dark-bg" />}><ComparisonSection /></Suspense>
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