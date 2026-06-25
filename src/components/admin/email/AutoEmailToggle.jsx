import React, { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AutoEmailToggle({ settings, onToggle }) {
  const [loading, setLoading] = useState(false);
  const enabled = settings?.auto_email_enabled !== false;

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(!enabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {enabled ? (
          <MailCheck className="w-5 h-5 text-orange-red flex-shrink-0" />
        ) : (
          <Mail className="w-5 h-5 text-white-dim flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-off-white truncate">Auto Confirmation Email</p>
          <p className="text-[10px] text-white-muted truncate">
            {enabled ? "Sending to new leads" : "Disabled — no auto emails sent"}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
          enabled ? "bg-orange-red" : "bg-[#333]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}