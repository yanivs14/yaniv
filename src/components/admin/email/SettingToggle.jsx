import React, { useState } from "react";

export default function SettingToggle({ title, description, enabled, onToggle, icon: Icon, iconColor, iconBg }) {
  const [loading, setLoading] = useState(false);

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
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${iconBg || "bg-teal-50"} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4.5 h-4.5 ${iconColor || "text-teal-600"}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          <p className="text-xs text-slate-500 truncate">
            {enabled ? "Active" : "Disabled"}
            {description ? ` — ${description}` : ""}
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