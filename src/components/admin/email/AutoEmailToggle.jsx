import React, { useState } from "react";
import { Mail, MailCheck } from "lucide-react";

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
    <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        {enabled ? (
          <MailCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
        ) : (
          <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">Auto Confirmation Email</p>
          <p className="text-xs text-slate-500 truncate">
            {enabled ? "Sending to new leads" : "Disabled — no auto emails sent"}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
          enabled ? "bg-teal-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}