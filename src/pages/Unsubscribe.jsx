import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSearchParams, Link } from "react-router-dom";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("lead_id");
  const email = searchParams.get("email");
  const [status, setStatus] = useState("confirm"); // confirm | loading | success | error
  const [result, setResult] = useState(null);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const res = await base44.functions.invoke("unsubscribeLead", { lead_id: leadId, email });
      setResult(res.data);
      setStatus("success");
    } catch (e) {
      setResult({ error: e.message });
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-[#1a1a1a]">
            <p className="text-[10px] text-white-dim uppercase tracking-[3px] font-semibold mb-1">The Movement</p>
            <p className="text-2xl font-heading font-black text-orange-red uppercase tracking-wide">Roye Gold</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {status === "confirm" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MailX className="w-7 h-7 text-orange-red" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">
                  Unsubscribe
                </h1>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-8">
                  {email
                    ? `We'll remove ${email} from our mailing list, lead database, and all connected marketing platforms. You won't receive any further emails from us.`
                    : "We'll remove you from our mailing list, lead database, and all connected marketing platforms. You won't receive any further emails from us."}
                </p>
                <button
                  onClick={handleUnsubscribe}
                  className="w-full bg-orange-red text-[#0a0a0a] font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors"
                >
                  Confirm Unsubscribe
                </button>
                <Link
                  to="/"
                  className="block mt-4 text-xs text-white-dim hover:text-white-muted transition-colors"
                >
                  Cancel and go back
                </Link>
              </div>
            )}

            {status === "loading" && (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 text-orange-red mx-auto mb-4 animate-spin" />
                <p className="font-body text-sm text-white-muted">Removing you from our lists...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <h1 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">
                  You're Unsubscribed
                </h1>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-6">
                  You've been successfully removed from our mailing list and all connected platforms. You won't hear from us again.
                </p>
                <Link
                  to="/"
                  className="inline-block text-xs text-white-dim hover:text-white-muted transition-colors"
                >
                  Back to site
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-off-white uppercase tracking-tight mb-3">
                  Something Went Wrong
                </h1>
                <p className="font-body text-sm text-white-muted leading-relaxed mb-6">
                  We couldn't process your unsubscribe request right now. Please try again or contact us directly.
                </p>
                <button
                  onClick={handleUnsubscribe}
                  className="w-full bg-orange-red text-[#0a0a0a] font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors mb-4"
                >
                  Try Again
                </button>
                <Link to="/" className="text-xs text-white-dim hover:text-white-muted transition-colors">
                  Back to site
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}