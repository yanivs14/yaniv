import React, { useState, useMemo } from "react";
import { Mail, CheckCircle, XCircle, Globe, Languages, ChevronDown, ChevronUp, Search, Zap, FileText } from "lucide-react";

function formatIsraelTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false
  }).replace(",", "");
}

const TEMPLATE_LABELS = {
  promotion: { label: "Promotion", icon: Zap, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
  custom: { label: "Custom", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  receipt: { label: "Receipt", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  refund: { label: "Refund", icon: FileText, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  welcome_skool: { label: "Welcome", icon: Zap, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
};

export default function EmailHistory({ logs, loading }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (l.recipient_email || "").toLowerCase().includes(q) ||
               (l.recipient_name || "").toLowerCase().includes(q) ||
               (l.subject || "").toLowerCase().includes(q) ||
               (l.campaign_name || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [logs, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Search + filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email, name, subject, or campaign..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${statusFilter === "all" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setStatusFilter("sent")}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${statusFilter === "sent" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"}`}
          >
            Sent ({logs.filter(l => l.status === "sent").length})
          </button>
          <button
            onClick={() => setStatusFilter("failed")}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${statusFilter === "failed" ? "bg-red-500 text-white border-red-500" : "bg-white text-slate-600 border-slate-300 hover:border-red-400"}`}
          >
            Failed ({logs.filter(l => l.status === "failed").length})
          </button>
        </div>
      </div>

      {/* Logs */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-body text-sm">No email history yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {filtered.map(log => {
            const isExpanded = expandedId === log.id;
            const isSent = log.status === "sent";
            const tpl = TEMPLATE_LABELS[log.template_name] || TEMPLATE_LABELS.custom;
            const TplIcon = tpl.icon;
            return (
              <div
                key={log.id}
                className={`rounded-xl border overflow-hidden transition-all shadow-sm ${isExpanded ? "border-teal-400 ring-1 ring-teal-500/10" : "border-slate-200"}`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-start gap-3 p-3.5 bg-white text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isSent
                      ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                      : <XCircle className="w-5 h-5 text-red-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-body font-semibold text-slate-900 truncate">
                        {log.recipient_name || log.recipient_email}
                      </p>
                      <span className={`flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full border ${tpl.color} ${tpl.border} ${tpl.bg}`}>
                        <TplIcon className="w-3 h-3" /> {tpl.label}
                      </span>
                      {log.campaign_name && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {log.campaign_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{log.subject}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-[10px] text-slate-400">{formatIsraelTime(log.created_date)}</span>
                      {log.country && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Globe className="w-2.5 h-2.5" /> {log.country}
                        </span>
                      )}
                      {log.language && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Languages className="w-2.5 h-2.5" /> {log.language}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  }
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-200 space-y-2">
                    <div className="flex gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-900">{log.recipient_email}</p>
                    </div>
                    {log.source && (
                      <div className="flex gap-2">
                        <span className="text-[10px] text-slate-400 w-16">Source</span>
                        <p className="text-xs text-slate-600 capitalize">{log.source}</p>
                      </div>
                    )}
                    {log.error_message && (
                      <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wide mb-1">Error</p>
                        <p className="text-xs text-red-500 break-all">{log.error_message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}