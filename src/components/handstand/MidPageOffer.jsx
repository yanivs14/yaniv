import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHandstandOffer } from "@/lib/handstandDeadline";
import { startStandaloneCheckout } from "@/lib/handstandCheckout";

export default function MidPageOffer({ c, t = {} }) {
  const { ctaText } = useHandstandOffer(t);
  const [loading, setLoading] = useState(false);
  if (!c) return null;

  const handleCheckout = async () => {
    setLoading(true);
    await startStandaloneCheckout("handstand_mid_page_offer");
    setLoading(false);
  };

  return (
    <section className="bg-dark-bg py-8 lg:py-10 border-y border-dark-border">
      <div className="max-w-2xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-heading text-base lg:text-lg font-bold text-off-white uppercase tracking-tight mb-1">{c.line1}</p>
          <p className="font-body text-[13px] lg:text-sm text-white-muted mb-0.5">{c.line2}</p>
          <p className="font-body text-xs text-white-dim mb-4">{c.line3}</p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            data-cta-id="handstand_mid_page_cta"
            className="inline-flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60"
          >
            {loading ? "Loading..." : <>{ctaText} <ArrowRight className="w-4 h-4" /></>}
          </button>
        </motion.div>
      </div>
    </section>
  );
}