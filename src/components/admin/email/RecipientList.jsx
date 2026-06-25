import React, { useState, useMemo } from "react";
import { Search, Mail, Globe, Languages, CheckSquare, Square, Users, Filter, MailCheck, Clock, CalendarClock, RefreshCw, Video } from "lucide-react";

const SOURCE_LABELS = {
  quiz: "Quiz",
  inner_circle: "Inner Circle",
  newsletter: "Newsletter",
};

const SOURCE_COLORS = {
  quiz: "bg-orange-red/15 text-orange-red border-orange-red/30",
  inner_circle: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  newsletter: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

export default function RecipientList({ recipients, selectedIds, onToggle, onToggleAll, onClear, emailLogMap, meetingsMap, loadingMeetings, onRefreshMeetings }) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [unsentOnly, setUnsentOnly] = useState(false);
  const [hasMeeting, setHasMeeting] = useState(false);

  const filtered = useMemo(() => {
    return recipients.filter(r => {
      if (unsentOnly && emailLogMap?.has((r.email || "").toLowerCase())) return false;
      if (hasMeeting && !meetingsMap?.[(r.email || "").toLowerCase()]?.length) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (r.email || "").toLowerCase().includes(q) ||
               (r.name || "").toLowerCase().includes(q) ||
               (r.phone || "").includes(q);
      }
      return true;
    });
  }, [recipients, search, sourceFilter, unsentOnly, hasMeeting, emailLogMap, meetingsMap]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selectedIds.has(r.id));
  const filteredIds = filtered.map(r => r.id);

  const countries = useMemo(() => {
    const set = new Set(recipients.map(r => r.country).filter(Boolean));
    return Array.from(set).sort();
  }, [recipients]);

  return (
    <div>
      {/* Search + filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-dim" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setSourceFilter("all")}
            className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === "all" ? "bg-orange-red text-dark-bg border-orange-red" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red"}`}
          >
            All ({recipients.length})
          </button>
          {Object.entries(SOURCE_LABELS).map(([key, label]) => {
            const count = recipients.filter(r => r.source === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSourceFilter(key)}
                className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === key ? "bg-orange-red text-dark-bg border-orange-red" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red"}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Unsent only toggle */}
          <button
            onClick={() => setUnsentOnly(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${unsentOnly ? "bg-green-500 text-dark-bg border-green-500" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red"}`}
          >
            <MailCheck className="w-3.5 h-3.5" />
            {unsentOnly ? "Showing unsent only" : "Unsent only"}
            {!unsentOnly && recipients.filter(r => !emailLogMap?.has((r.email || "").toLowerCase())).length > 0 && (
              <span className="text-[10px] font-bold opacity-70">
                ({recipients.filter(r => !emailLogMap?.has((r.email || "").toLowerCase())).length})
              </span>
            )}
          </button>

          {/* Has meeting toggle */}
          <button
            onClick={() => setHasMeeting(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${hasMeeting ? "bg-orange-red text-dark-bg border-orange-red" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red"}`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            {hasMeeting ? "Showing scheduled" : "Has call"}
            {!hasMeeting && recipients.filter(r => meetingsMap?.[(r.email || "").toLowerCase()]?.length).length > 0 && (
              <span className="text-[10px] font-bold opacity-70">
                ({recipients.filter(r => meetingsMap?.[(r.email || "").toLowerCase()]?.length).length})
              </span>
            )}
          </button>

          {/* Refresh meetings */}
          <button
            onClick={onRefreshMeetings}
            disabled={loadingMeetings}
            className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMeetings ? "animate-spin" : ""}`} />
            Sync Calendly
          </button>
        </div>
      </div>

      {/* Select all bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => onToggleAll(filteredIds)}
          className="flex items-center gap-2 text-xs text-white-muted hover:text-off-white transition-colors"
        >
          {allFilteredSelected
            ? <CheckSquare className="w-4 h-4 text-orange-red" />
            : <Square className="w-4 h-4" />
          }
          Select all ({filtered.length})
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-white-dim hover:text-red-400 transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Recipient list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-white-dim mx-auto mb-3" />
          <p className="text-white-muted font-body text-sm">No recipients found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const selected = selectedIds.has(r.id);
            const emailLog = emailLogMap?.get((r.email || "").toLowerCase());
            return (
              <button
                key={r.id}
                onClick={() => onToggle(r.id)}
                className={`w-full flex items-start gap-3 text-left p-3 rounded-xl border transition-all ${selected ? "border-orange-red bg-orange-red/5" : "border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a]"}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {selected
                    ? <CheckSquare className="w-5 h-5 text-orange-red" />
                    : <Square className="w-5 h-5 text-white-dim" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-body font-semibold text-off-white truncate">
                      {r.name || "Unknown"}
                    </p>
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${SOURCE_COLORS[r.source] || SOURCE_COLORS.quiz}`}>
                      {SOURCE_LABELS[r.source] || r.source || "Lead"}
                    </span>
                    {emailLog && (
                      <span className="flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full border bg-green-500/15 text-green-400 border-green-500/30" title={`Last sent: ${formatDate(emailLog.lastDate)}`}>
                        <MailCheck className="w-3 h-3" />
                        {emailLog.sentCount} sent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-white-dim flex-shrink-0" />
                    <p className="text-xs text-white-muted truncate">{r.email}</p>
                  </div>
                  {emailLog && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-green-400/60 flex-shrink-0" />
                      <p className="text-[10px] text-green-400/60">Last: {formatDate(emailLog.lastDate)}</p>
                    </div>
                  )}
                  {meetingsMap?.[(r.email || "").toLowerCase()]?.map((m, i) => (
                    <div key={m.event_uuid + i} className="mt-1.5 bg-orange-red/10 border border-orange-red/25 rounded-lg px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                        <p className="text-[11px] text-off-white font-semibold">{m.formatted_time}</p>
                      </div>
                      <p className="text-[10px] text-white-muted mt-0.5 ml-5">{m.event_name}</p>
                      {m.join_url && (
                        <a href={m.join_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 mt-1 ml-5 text-[10px] text-orange-red hover:underline">
                          <Video className="w-3 h-3" /> Join call
                        </a>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {r.country && (
                      <span className="flex items-center gap-1 text-[10px] text-white-dim">
                        <Globe className="w-3 h-3" /> {r.country}
                      </span>
                    )}
                    {r.language && (
                      <span className="flex items-center gap-1 text-[10px] text-white-dim">
                        <Languages className="w-3 h-3" /> {r.language}
                      </span>
                    )}
                    {r.phone && r.phone !== "-" && (
                      <span className="text-[10px] text-white-dim">📱 {r.phone}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}