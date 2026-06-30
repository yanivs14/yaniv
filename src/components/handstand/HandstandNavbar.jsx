import React from "react";
import { ArrowRight } from "lucide-react";

export default function HandstandNavbar({ c }) {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <span className="font-heading text-xl font-bold text-off-white uppercase tracking-tight">
          {c?.brandName || "Handstand"}
        </span>
        <button
          onClick={scrollToPricing}
          data-cta-id="handstand_nav_cta"
          className="flex items-center gap-1.5 bg-orange-red text-dark-bg font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors"
        >
          {c?.navCtaText || "Enroll Now"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}