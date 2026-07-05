import React, { useState, useMemo } from "react";
import { Search, Mail, Globe, Languages, CheckSquare, Square, Users, MailCheck, Clock, CalendarClock, RefreshCw, Video } from "lucide-react";

const SOURCE_LABELS = {
  quiz: "Quiz",
  inner_circle: "Inner Circle",
  newsletter: "Newsletter",
};

const SOURCE_COLORS = {
  quiz: "bg-teal-50 text-teal-700 border-teal-200",
  inner_circle: "bg-blue-50 text-blue-700 border-blue-200",
  newsletter: "bg-purple-50 text-purple-700 border-purple-200",
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

  return (
    <div>
      {/* Search + filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setSourceFilter("all")}
            className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === "all" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}
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
                className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === key ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setUnsentOnly(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${unsentOnly ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"}`}
          >
            <MailCheck className="w-3.5 h-3.5" />
            {unsentOnly ? "Showing unsent only" : "Unsent only"}
            {!unsentOnly && recipients.filter(r => !emailLogMap?.has((r.email || "").toLowerCase())).length > 0 && (
              <span className="text-[10px] font-bold opacity-70">
                ({recipients.filter(r => !emailLogMap?.has((r.email || "").toLowerCase())).length})
              </span>
            )}
          </button>

          <button
            onClick={() => setHasMeeting(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${hasMeeting ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            {hasMeeting ? "Showing scheduled" : "Has call"}
            {!hasMeeting && recipients.filter(r => meetingsMap?.[(r.email || "").toLowerCase()]?.length).length > 0 && (
              <span className="text-[10px] font-bold opacity-70">
                ({recipients.filter(r => meetingsMap?.[(r.email || "").toLowerCase()]?.length).length})
              </span>
            )}
          </button>

          <button
            onClick={onRefreshMeetings}
            disabled={loadingMeetings}
            className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border bg-white text-slate-600 border-slate-300 hover:border-teal-400 transition-colors disabled:opacity-50"
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
          className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          {allFilteredSelected
            ? <CheckSquare className="w-4 h-4 text-teal-600" />
            : <Square className="w-4 h-4 text-slate-400" />
          }
          Select all ({filtered.length})
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Recipient list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-body text-sm">No recipients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {filtered.map(r => {
            const selected = selectedIds.has(r.id);
            const emailLog = emailLogMap?.get((r.email || "").toLowerCase());
            return (
              <button
                key={r.id}
                onClick={() => onToggle(r.id)}
                className={`w-full flex items-start gap-3 text-left p-3.5 rounded-xl border transition-all shadow-sm ${selected ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/20" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {selected
                    ? <CheckSquare className="w-5 h-5 text-teal-600" />
                    : <Square className="w-5 h-5 text-slate-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-body font-semibold text-slate-900 truncate">
                      {r.name || "Unknown"}
                    </p>
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${SOURCE_COLORS[r.source] || SOURCE_COLORS.quiz}`}>
                      {SOURCE_LABELS[r.source] || r.source || "Lead"}
                    </span>
                    {emailLog && (
                      <span className="flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200" title={`Last sent: ${formatDate(emailLog.lastDate)}`}>
                        <MailCheck className="w-3 h-3" />
                        {emailLog.sentCount} sent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-xs text-slate-500 truncate">{r.email}</p>
                  </div>
                  {emailLog && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <p className="text-[10px] text-emerald-600">Last: {formatDate(emailLog.lastDate)}</p>
                    </div>
                  )}
                  {meetingsMap?.[(r.email || "").toLowerCase()]?.map((m, i) => (
                    <div key={m.event_uuid + i} className="mt-1.5 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <p className="text-[11px] text-slate-900 font-semibold">{m.formatted_time}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-5">{m.event_name}</p>
                      {m.join_url && (
                        <a href={m.join_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 mt-1 ml-5 text-[10px] text-teal-600 hover:underline">
                          <Video className="w-3 h-3" /> Join call
                        </a>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {r.country && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Globe className="w-3 h-3" /> {r.country}
                      </span>
                    )}
                    {r.language && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Languages className="w-3 h-3" /> {r.language}
                      </span>
                    )}
                    {r.phone && r.phone !== "-" && (
                      <span className="text-[10px] text-slate-400">📱 {r.phone}</span>
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