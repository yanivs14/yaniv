import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";

let _checkoutInProgress = false;
async function startCheckout(plan) {
  if (_checkoutInProgress) return;
  if (window.self !== window.top) {
    alert("Checkout is only available from the published app.");
    return;
  }
  _checkoutInProgress = true;
  try {
    track(plan === "annual" ? "final_annual_cta_clicked" : "final_monthly_cta_clicked", { plan });
    track("checkout_started", { plan });
    const res = await base44.functions.invoke("createCheckout", { plan, ga_client_id: getGaClientId() });
    if (res.data?.url) window.location.href = res.data.url;
  } finally {
    _checkoutInProgress = false;
  }
}

export default function GiftProof({ c }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  if (!c) return null;

  const handleFaqToggle = (i) => {
    const isOpening = openFaq !== i;
    setOpenFaq(isOpening ? i : null);
    if (isOpening) {
      track("movement_reset_faq_opened", { question_id: `faq_${i + 1}`, question: c.faqs?.[i]?.q || "" });
    }
  };

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan);
    await startCheckout(plan);
    setCheckoutLoading(null);
  };

  const handleQuestion = () => {
    track("membership_question_clicked");
    const msg = encodeURIComponent(c.final.questionMessage || "");
    const url = c.final.supportUrl
      ? `${c.final.supportUrl}${c.final.supportUrl.includes("?") ? "&" : "?"}message=${msg}`
      : null;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const testimonials = c.testimonials || [];
  const faqs = c.faqs || [];

  return (
    <section className="bg-dark-surface py-14 lg:py-20 border-t border-dark-border">
      {/* Testimonials */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 mb-14 lg:mb-20">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight text-center mb-10">
          {c.testimonialsHeading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-dark-bg border border-dark-border rounded-2xl p-6 flex flex-col"
            >
              <p className="font-body text-sm text-off-white leading-relaxed italic mb-4 flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                {t.img ? (
                  <img src={t.img} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-orange-red/15 flex items-center justify-center text-orange-red font-heading font-bold text-sm">
                    {(t.name || "?").charAt(0)}
                  </span>
                )}
                <span className="font-body text-sm font-semibold text-off-white">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 lg:px-10 mb-14 lg:mb-20">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-off-white uppercase tracking-tight text-center mb-8">
          {c.faqHeading}
        </h2>
        <div className="space-y-2.5">
          {faqs.map((item, i) => (
            <div key={i} className="bg-dark-bg border border-dark-border rounded-xl overflow-hidden">
              <button
                onClick={() => handleFaqToggle(i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="font-body text-sm font-semibold text-off-white">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-white-muted flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="font-body text-sm text-white-muted leading-relaxed px-5 pb-4">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-dark-bg to-dark-surface border border-dark-border rounded-3xl px-6 py-10 lg:py-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-off-white uppercase tracking-tight leading-[1.05] mb-4">
            {c.final.headline}
          </h2>
          <p className="font-body text-base text-white-muted leading-relaxed max-w-xl mx-auto mb-8">{c.final.copy}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleCheckout("annual")}
              disabled={checkoutLoading === "annual"}
              className="flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-orange-red-hover transition-colors w-full sm:w-auto disabled:opacity-60"
            >
              {checkoutLoading === "annual" ? "Loading..." : <>{c.final.primaryCta} <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              onClick={() => handleCheckout("monthly")}
              disabled={checkoutLoading === "monthly"}
              className="font-body text-sm font-semibold text-off-white border border-dark-border rounded-full px-7 py-3.5 hover:border-orange-red/50 transition-colors w-full sm:w-auto disabled:opacity-60"
            >
              {checkoutLoading === "monthly" ? "Loading..." : c.final.secondaryCta}
            </button>
          </div>
          <button
            onClick={handleQuestion}
            className="mt-4 font-body text-xs text-white-muted hover:text-orange-red transition-colors underline underline-offset-4"
          >
            {c.final.tertiaryLink}
          </button>
        </motion.div>
      </div>
    </section>
  );
}