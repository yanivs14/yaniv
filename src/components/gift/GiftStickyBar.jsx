import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { track, getGaClientId } from "@/lib/analytics";

export default function GiftStickyBar({ visible, mode, annualCta }) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  const handleView = () => {
    const el = document.getElementById("membership");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnnual = async () => {
    if (window.self !== window.top) {
      alert("Checkout is only available from the published app.");
      return;
    }
    track("annual_membership_clicked", { plan: "annual", source: "sticky_bar" });
    track("checkout_started", { plan: "annual", source: "sticky_bar" });
    try {
      const res = await base44.functions.invoke("createCheckout", { plan: "annual", ga_client_id: getGaClientId() });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {}
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-md border-t border-dark-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-3 right-3 w-6 h-6 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-white-muted hover:text-off-white"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="font-body text-xs font-semibold text-off-white">
            {mode === "annual" ? "Continue with Roye" : "Continue with Roye"}
          </span>
          {mode === "annual" ? (
            <button
              onClick={handleAnnual}
              className="bg-orange-red text-dark-bg font-body text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors"
            >
              {annualCta || "Begin Annual"}
            </button>
          ) : (
            <button
              onClick={handleView}
              className="bg-orange-red text-dark-bg font-body text-xs font-bold px-5 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors"
            >
              View Membership
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}