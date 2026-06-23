import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { CheckCircle, ArrowRight, Mail, Sparkles, Home, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const PLAN_LABELS = {
  monthly: "Monthly Membership",
  annual: "Annual Membership",
  promo: "Promo Membership",
};

export default function ThankYou() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Prevent duplicate processing on refresh
    const processedKey = `checkout_processed_${sessionId}`;
    if (sessionStorage.getItem(processedKey)) {
      setSession({ alreadyProcessed: true, transaction_id: sessionId });
      setLoading(false);
      return;
    }
    sessionStorage.setItem(processedKey, "true");

    base44.functions.invoke("getCheckoutSession", { session_id: sessionId })
      .then(res => {
        const data = res.data || {};
        setSession({
          transaction_id: data.transaction_id || sessionId,
          value: data.value,
          currency: data.currency || "USD",
          plan: data.plan,
          plan_label: data.plan_label || PLAN_LABELS[data.plan] || "Membership",
          customer_name: data.customer_name,
          customer_email: data.customer_email,
        });

        // Analytics
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "purchase_complete",
          currency: data.currency || "USD",
          transaction_id: data.transaction_id || sessionId,
          value: data.value || 0,
        });
      })
      .catch(() => {
        setError(true);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "purchase_complete",
          currency: "USD",
          transaction_id: sessionId,
          value: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = session?.customer_name?.split(" ")[0] || "";

  return (
    <>
      <Helmet>
        <title>Welcome to The Movement | Roye Gold</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-body">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold text-off-white uppercase tracking-widest">The Movement</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-xs text-white-muted hover:text-orange-red transition-colors">
              <Home className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
          <div className="max-w-2xl w-full mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-orange-red border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-white-muted">Confirming your payment...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center text-center"
              >
                {/* Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-orange-red/10 border border-orange-red/30 flex items-center justify-center mb-8"
                >
                  <CheckCircle className="w-10 h-10 text-orange-red" />
                </motion.div>

                {/* Eyebrow */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-body text-sm text-orange-red uppercase tracking-widest mb-3"
                >
                  Payment Confirmed
                </motion.p>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-tight text-off-white leading-[0.95] mb-4"
                >
                  {firstName ? `You're In, ${firstName}.` : "You're In."}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-body text-base sm:text-lg text-white-muted leading-relaxed max-w-lg mb-10"
                >
                  Welcome to The Movement. Your journey to better mobility, strength, and longevity starts now.
                </motion.p>

                {/* Purchase details card */}
                {session?.plan && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full max-w-md mb-10"
                  >
                    <div
                      className="rounded-2xl p-6 sm:p-8 text-left"
                      style={{
                        background: "linear-gradient(145deg, #0d1a1a 0%, #111 100%)",
                        border: "1px solid #1e3333",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-orange-red to-transparent" />
                      <p className="font-body text-xs text-orange-red uppercase tracking-widest mb-4">Order Summary</p>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-[#1a2a2a]">
                          <span className="font-body text-sm text-white-muted">Plan</span>
                          <span className="font-heading text-base font-bold text-off-white uppercase">{session.plan_label}</span>
                        </div>
                        {session.value != null && (
                          <div className="flex justify-between items-center pb-3 border-b border-[#1a2a2a]">
                            <span className="font-body text-sm text-white-muted">Amount</span>
                            <span className="font-body text-base font-bold text-orange-red">
                              ${session.value.toFixed(2)} {session.currency}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-body text-sm text-white-muted">Transaction ID</span>
                          <span className="font-body text-xs text-white-dim font-mono truncate max-w-[200px]">
                            {session.transaction_id?.slice(0, 24)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Next steps */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="w-full max-w-md mb-10"
                >
                  <p className="font-body text-xs text-white-muted uppercase tracking-widest mb-4 text-left">What's Next</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-7 h-7 rounded-full bg-orange-red/10 border border-orange-red/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-orange-red" />
                      </div>
                      <div>
                        <p className="font-body text-sm text-off-white font-semibold">Check your email</p>
                        <p className="font-body text-xs text-white-muted leading-relaxed">
                          We've sent your login details and getting started guide to {session?.customer_email || "your email"}.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-7 h-7 rounded-full bg-orange-red/10 border border-orange-red/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Dumbbell className="w-3.5 h-3.5 text-orange-red" />
                      </div>
                      <div>
                        <p className="font-body text-sm text-off-white font-semibold">Start your first session</p>
                        <p className="font-body text-xs text-white-muted leading-relaxed">
                          Begin with the Foundation Track — 10 minutes a day is all you need.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-7 h-7 rounded-full bg-orange-red/10 border border-orange-red/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-red" />
                      </div>
                      <div>
                        <p className="font-body text-sm text-off-white font-semibold">Join the community</p>
                        <p className="font-body text-xs text-white-muted leading-relaxed">
                          Connect with 800+ members, join challenges, and get weekly coaching.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
                >
                  <Link
                    to="/"
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
                  >
                    Back to Home
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="https://www.skool.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-dark-border text-off-white font-body text-sm font-bold py-3.5 rounded-full hover:border-orange-red hover:text-orange-red transition-colors"
                  >
                    Join Community
                  </a>
                </motion.div>

                {/* Footer note */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="font-body text-xs text-white-dim mt-8"
                >
                  A confirmation receipt has been sent to your email. Need help? Reply to your confirmation email.
                </motion.p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}