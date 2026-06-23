import React, { useState, useMemo } from "react";
import { Mail, CheckCircle, XCircle, Globe, Languages, ChevronDown, ChevronUp, Clock, Filter, Search, Zap, FileText } from "lucide-react";

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
  promotion: { label: "Promotion", icon: Zap, color: "text-orange-red" },
  custom: { label: "Custom", icon: FileText, color: "text-blue-400" },
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
        <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Search + filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-dim" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email, name, subject, or campaign..."
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${statusFilter === "all" ? "bg-orange-red text-dark-bg border-orange-red" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a]"}`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setStatusFilter("sent")}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${statusFilter === "sent" ? "bg-green-500 text-dark-bg border-green-500" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a]"}`}
          >
            Sent ({logs.filter(l => l.status === "sent").length})
          </button>
          <button
            onClick={() => setStatusFilter("failed")}
            className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${statusFilter === "failed" ? "bg-red-500 text-dark-bg border-red-500" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a]"}`}
          >
            Failed ({logs.filter(l => l.status === "failed").length})
          </button>
        </div>
      </div>

      {/* Logs */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="w-10 h-10 text-white-dim mx-auto mb-3" />
          <p className="text-white-muted font-body text-sm">No email history yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => {
            const isExpanded = expandedId === log.id;
            const isSent = log.status === "sent";
            const tpl = TEMPLATE_LABELS[log.template_name] || TEMPLATE_LABELS.custom;
            const TplIcon = tpl.icon;
            return (
              <div
                key={log.id}
                className={`rounded-xl border overflow-hidden transition-colors ${isExpanded ? "border-orange-red/40" : "border-[#2a2a2a]"}`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-start gap-3 p-3 bg-[#111] text-left hover:bg-[#141414] transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isSent
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : <XCircle className="w-5 h-5 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-body font-semibold text-off-white truncate">
                        {log.recipient_name || log.recipient_email}
                      </p>
                      <span className={`flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full border ${tpl.color} border-current/30 bg-current/10`}>
                        <TplIcon className="w-3 h-3" /> {tpl.label}
                      </span>
                      {log.campaign_name && (
                        <span className="text-[10px] text-white-dim bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                          {log.campaign_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white-muted truncate mt-0.5">{log.subject}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-[10px] text-white-dim">{formatIsraelTime(log.created_date)}</span>
                      {log.country && (
                        <span className="flex items-center gap-0.5 text-[10px] text-white-dim">
                          <Globe className="w-2.5 h-2.5" /> {log.country}
                        </span>
                      )}
                      {log.language && (
                        <span className="flex items-center gap-0.5 text-[10px] text-white-dim">
                          <Languages className="w-2.5 h-2.5" /> {log.language}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-white-dim flex-shrink-0 mt-1" />
                    : <ChevronDown className="w-4 h-4 text-white-dim flex-shrink-0 mt-1" />
                  }
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-[#0d0d0d] border-t border-[#1a1a1a] space-y-2">
                    <div className="flex gap-2">
                      <Mail className="w-3.5 h-3.5 text-white-dim flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-off-white">{log.recipient_email}</p>
                    </div>
                    {log.source && (
                      <div className="flex gap-2">
                        <span className="text-[10px] text-white-dim w-16">Source</span>
                        <p className="text-xs text-white-muted capitalize">{log.source}</p>
                      </div>
                    )}
                    {log.error_message && (
                      <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wide mb-1">Error</p>
                        <p className="text-xs text-red-300 break-all">{log.error_message}</p>
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