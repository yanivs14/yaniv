import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw, Mail, Users, MousePointerClick, Eye, UserMinus, Tag,
  Send, Layers, ChevronDown, ChevronUp, Search, Inbox, Calendar,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import KitSubscriberEmails from "@/components/admin/email/KitSubscriberEmails";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function formatPercent(n) {
  if (!n || n === 0) return "0%";
  return `${(n * 100).toFixed(1)}%`;
}

function formatNumber(n) {
  if (!n) return "0";
  return n.toLocaleString("en-US");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function computeDateRange(year, fromMonth, toMonth) {
  if (year === "all") return null;
  const y = parseInt(year);
  let fromM = fromMonth === "all" ? 0 : parseInt(fromMonth);
  let toM = toMonth === "all" ? 11 : parseInt(toMonth);
  if (fromM > toM) { const tmp = fromM; fromM = toM; toM = tmp; }
  const lastDay = new Date(y, toM + 1, 0).getDate();
  return {
    startDate: new Date(y, fromM, 1),
    endDate: new Date(y, toM, lastDay, 23, 59, 59),
    created_after: `${y}-${String(fromM + 1).padStart(2, "0")}-01`,
    created_before: `${y}-${String(toM + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

function StatCard({ icon: Icon, label, value, sublabel, color, bg }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 font-body uppercase tracking-wide truncate">{label}</p>
          <p className="text-lg font-body font-bold text-slate-900 leading-tight">{value}</p>
          {sublabel && <p className="text-[10px] text-slate-400 font-body">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

export default function KitTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tagData, setTagData] = useState(null);
  const [tagLoading, setTagLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Unified filter state — controls both analytics and broadcasts
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [fromMonth, setFromMonth] = useState("all");
  const [toMonth, setToMonth] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const target_year = filterYear === "all" ? "all" : parseInt(filterYear);
      const res = await base44.functions.invoke("getKitStats", { target_year });
      setData(res.data);
    } catch (e) {
      console.error("Failed to load Kit stats:", e);
    }
    setLoading(false);
  }, [filterYear]);

  useEffect(() => { loadData(); }, [loadData]);

  const summary = data?.summary || {};
  const broadcasts = data?.broadcasts || [];
  const sequences = (data?.sequences || []).filter(s => s.subscribers > 0);
  const baseTags = data?.tags || [];

  const availableYears = useMemo(() => {
    const years = new Set();
    const cy = new Date().getFullYear();
    for (let y = cy; y >= cy - 3; y--) years.add(y);
    broadcasts.forEach(b => {
      const dateStr = b.sent_at || b.created_at;
      if (dateStr) {
        const year = new Date(dateStr).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [broadcasts]);

  const dateRange = useMemo(
    () => computeDateRange(filterYear, fromMonth, toMonth),
    [filterYear, fromMonth, toMonth]
  );

  const hasDateFilter = filterYear !== "all";

  // Load date-filtered tag counts when date filter changes
  useEffect(() => {
    if (!dateRange) { setTagData(null); return; }
    setTagLoading(true);
    base44.functions.invoke("getKitTagCounts", {
      created_after: dateRange.created_after,
      created_before: dateRange.created_before,
    })
      .then(res => setTagData(res.data))
      .catch(e => { console.error("Failed to load tag counts:", e); setTagData(null); })
      .finally(() => setTagLoading(false));
  }, [dateRange?.created_after, dateRange?.created_before]);

  // Analytics summary — broadcast stats filtered by date range
  const analyticsSummary = useMemo(() => {
    const matching = broadcasts.filter(b => {
      if (!b.is_sent) return false;
      if (!dateRange) return true;
      const d = new Date(b.sent_at || b.created_at);
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
    const agg = matching.reduce((acc, b) => {
      acc.recipients += b.stats?.recipients || 0;
      acc.opens += b.stats?.opens || 0;
      acc.clicks += b.stats?.clicks || 0;
      acc.unsubscribes += b.stats?.unsubscribes || 0;
      acc.sent += 1;
      return acc;
    }, { recipients: 0, opens: 0, clicks: 0, unsubscribes: 0, sent: 0 });
    return {
      total_subscribers: tagData?.total_subscribers ?? summary.total_subscribers,
      total_broadcasts_sent: agg.sent,
      total_recipients: agg.recipients,
      total_opens: agg.opens,
      total_clicks: agg.clicks,
      total_unsubscribes: agg.unsubscribes,
      avg_open_rate: agg.recipients > 0 ? agg.opens / agg.recipients : 0,
      avg_click_rate: agg.recipients > 0 ? agg.clicks / agg.recipients : 0,
      total_sequences: summary.total_sequences,
      total_tags: summary.total_tags,
    };
  }, [broadcasts, summary, dateRange, tagData]);

  // Broadcasts list — filtered by same date range + search + status
  const dateFilteredBroadcasts = useMemo(() => {
    if (!dateRange) return broadcasts;
    return broadcasts.filter(b => {
      const d = new Date(b.sent_at || b.created_at);
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
  }, [broadcasts, dateRange]);

  const filteredBroadcasts = useMemo(() => {
    return dateFilteredBroadcasts.filter(b => {
      if (filter === "sent" && !b.is_sent) return false;
      if (filter === "draft" && b.is_sent) return false;
      if (search) {
        const q = search.toLowerCase();
        return (b.subject || "").toLowerCase().includes(q) ||
               (b.description || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [dateFilteredBroadcasts, filter, search]);

  const filterTabs = useMemo(() => [
    { key: "all", label: "All", count: dateFilteredBroadcasts.length },
    { key: "sent", label: "Sent", count: dateFilteredBroadcasts.filter(b => b.is_sent).length },
    { key: "draft", label: "Drafts", count: dateFilteredBroadcasts.filter(b => !b.is_sent).length },
  ], [dateFilteredBroadcasts]);

  // Tags to display — date-filtered if available, else total
  const displayTags = tagData?.tags || baseTags;

  const clearFilters = () => {
    setFilterYear(String(new Date().getFullYear()));
    setFromMonth("all");
    setToMonth("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-body">Failed to load Kit data</p>
        <button onClick={loadData} className="mt-3 text-xs text-teal-600 hover:underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Mail className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <h2 className="font-body text-base font-bold text-slate-900">Kit Analytics</h2>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-teal-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Unified date filter — controls analytics + broadcasts + tags */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-400 font-body font-medium uppercase tracking-wide">Range</span>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-body text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {hasDateFilter && (
            <>
              <select
                value={fromMonth}
                onChange={e => setFromMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-body text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                <option value="all">From: Any</option>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <span className="text-slate-300 text-xs">→</span>
              <select
                value={toMonth}
                onChange={e => setToMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-body text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                <option value="all">To: Any</option>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </>
          )}
          {hasDateFilter && (
            <button onClick={clearFilters} className="text-xs text-teal-600 hover:underline font-body ml-auto">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatCard icon={Users} label="Subscribers" value={formatNumber(analyticsSummary.total_subscribers)} color="text-teal-600" bg="bg-teal-50" />
        <StatCard icon={Send} label="Broadcasts Sent" value={formatNumber(analyticsSummary.total_broadcasts_sent)} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={Eye} label="Avg Open Rate" value={formatPercent(analyticsSummary.avg_open_rate)} sublabel={`${formatNumber(analyticsSummary.total_opens)} opens`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={MousePointerClick} label="Avg Click Rate" value={formatPercent(analyticsSummary.avg_click_rate)} sublabel={`${formatNumber(analyticsSummary.total_clicks)} clicks`} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatCard icon={Mail} label="Total Recipients" value={formatNumber(analyticsSummary.total_recipients)} color="text-slate-600" bg="bg-slate-100" />
        <StatCard icon={UserMinus} label="Unsubscribes" value={formatNumber(analyticsSummary.total_unsubscribes)} color="text-red-600" bg="bg-red-50" />
        <StatCard icon={Layers} label="Sequences" value={formatNumber(analyticsSummary.total_sequences)} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={Tag} label="Tags" value={formatNumber(analyticsSummary.total_tags)} color="text-orange-600" bg="bg-orange-50" />
      </div>

      {/* Tags section — subscriber counts per tag (date-filtered) */}
      {displayTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <h3 className="font-body text-sm font-bold text-slate-700">Tags</h3>
              {hasDateFilter && (
                <span className="text-[10px] text-teal-600 font-body bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {dateRange ? `${MONTHS[parseInt(fromMonth === "all" ? 0 : fromMonth)]}–${MONTHS[parseInt(toMonth === "all" ? 11 : toMonth)]} ${filterYear}` : filterYear}
                </span>
              )}
            </div>
            {tagLoading && (
              <div className="w-3 h-3 border border-teal-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {displayTags.map(t => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-body font-medium text-slate-600 truncate">{t.name}</p>
                  <p className="text-sm font-body font-bold text-slate-900">{formatNumber(t.subscriber_count)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcasts section — filtered by same date range */}
      <div>
        <h3 className="font-body text-sm font-bold text-slate-700 mb-2 px-1">
          Recent Broadcasts
          {hasDateFilter && (
            <span className="text-[10px] text-slate-400 font-normal ml-1">
              ({dateFilteredBroadcasts.length} in range)
            </span>
          )}
        </h3>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search broadcasts..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2.5" style={{ scrollbarWidth: "none" }}>
          {filterTabs.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 text-sm font-body px-3.5 py-1.5 rounded-full border transition-colors ${filter === f.key ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Broadcast list */}
        {filteredBroadcasts.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-body">No broadcasts found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBroadcasts.map((b, i) => {
              const expanded = expandedId === b.id;
              const isSent = b.is_sent;
              return (
                <div key={b.id || i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedId(expanded ? null : b.id)}
                    className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {b.thumbnail_url ? (
                          <img src={b.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Mail className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-body font-semibold text-slate-900 truncate">{b.subject}</p>
                          <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${isSent ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {isSent ? "Sent" : "Draft"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isSent ? formatTime(b.sent_at) : `Created ${formatTime(b.created_at)}`}
                        </p>
                        {isSent && (
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Send className="w-3 h-3" /> {formatNumber(b.stats.recipients)}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                              <Eye className="w-3 h-3" /> {formatPercent(b.stats.open_rate)}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-amber-600">
                              <MousePointerClick className="w-3 h-3" /> {formatPercent(b.stats.click_rate)}
                            </span>
                            {b.stats.unsubscribes > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-red-500">
                                <UserMinus className="w-3 h-3" /> {b.stats.unsubscribes}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
                    </div>
                  </button>
                  {expanded && isSent && (
                    <div className="border-t border-slate-100 px-3 py-3 bg-slate-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase">Recipients</p>
                          <p className="text-sm font-bold text-slate-900">{formatNumber(b.stats.recipients)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase">Opens</p>
                          <p className="text-sm font-bold text-emerald-600">{formatNumber(b.stats.opens)} <span className="text-[10px] font-normal text-slate-400">({formatPercent(b.stats.open_rate)})</span></p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase">Clicks</p>
                          <p className="text-sm font-bold text-amber-600">{formatNumber(b.stats.clicks)} <span className="text-[10px] font-normal text-slate-400">({formatPercent(b.stats.click_rate)})</span></p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase">Total Clicks</p>
                          <p className="text-sm font-bold text-slate-900">{formatNumber(b.stats.total_clicks)}</p>
                        </div>
                      </div>
                      {b.description && (
                        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{b.description}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sequences section — accurate subscriber_count from API */}
      {sequences.length > 0 && (
        <div>
          <h3 className="font-body text-sm font-bold text-slate-700 mb-2 px-1">
            Sequences <span className="text-slate-400 font-normal">({sequences.length} with subscribers)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sequences.map((s, i) => (
              <div key={s.id || i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-semibold text-slate-900 truncate">{s.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] text-slate-400">{formatNumber(s.subscribers)} subscribers</p>
                    {s.email_count > 0 && (
                      <span className="text-[10px] text-slate-300">·</span>
                    )}
                    {s.email_count > 0 && (
                      <p className="text-[10px] text-slate-400">{s.email_count} emails</p>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-body px-2 py-0.5 rounded-full flex-shrink-0 ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {s.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriber Email History — search any subscriber to see their email timeline */}
      <KitSubscriberEmails broadcasts={broadcasts} />
    </div>
  );
}