import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Mail, Layers, Tag, Calendar, RefreshCw, Inbox, User,
  ChevronDown, ChevronUp, Send, Clock, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function buildTimeline(subscribedSequences, broadcasts, subscriberCreatedAt) {
  const items = [];

  // Add broadcasts — only those sent after subscriber joined
  const subDate = subscriberCreatedAt ? new Date(subscriberCreatedAt) : null;
  for (const b of broadcasts) {
    const sentDate = b.sent_at ? new Date(b.sent_at) : null;
    if (subDate && sentDate && sentDate < subDate) continue;
    items.push({
      type: "broadcast",
      subject: b.subject,
      date: b.sent_at,
      sequence_name: null,
      position: null,
      sortDate: sentDate ? sentDate.getTime() : 0,
    });
  }

  // Add sequence emails — estimate send date based on subscription date + delay
  for (const seq of subscribedSequences) {
    const subDate = seq.subscribed_at ? new Date(seq.subscribed_at) : null;
    for (const email of seq.emails) {
      if (!email.published) continue;
      // Estimate: subscription date + delay (simplified — doesn't account for send_days)
      let estimatedDate = subDate;
      if (subDate && email.delay_value && email.delay_unit) {
        estimatedDate = new Date(subDate);
        if (email.delay_unit === "days") {
          estimatedDate.setDate(estimatedDate.getDate() + email.delay_value);
        } else if (email.delay_unit === "hours") {
          estimatedDate.setHours(estimatedDate.getHours() + email.delay_value);
        } else if (email.delay_unit === "weeks") {
          estimatedDate.setDate(estimatedDate.getDate() + (email.delay_value * 7));
        } else if (email.delay_unit === "months") {
          estimatedDate.setMonth(estimatedDate.getMonth() + email.delay_value);
        }
      }
      items.push({
        type: "sequence",
        subject: email.subject,
        date: estimatedDate ? estimatedDate.toISOString() : null,
        sequence_name: seq.sequence_name,
        position: email.position,
        is_estimated: true,
        sortDate: estimatedDate ? estimatedDate.getTime() : 0,
      });
    }
  }

  // Sort by date descending (newest first)
  return items.sort((a, b) => b.sortDate - a.sortDate);
}

const TYPE_META = {
  broadcast: { label: "Broadcast", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Send },
  sequence: { label: "Sequence", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Layers },
};

export default function KitSubscriberEmails() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSeq, setExpandedSeq] = useState(null);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await base44.functions.invoke("getKitSubscriberEmails", { email: search.trim() });
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch subscriber emails:", e);
      setError(e?.response?.data?.error || "Failed to fetch data");
    }
    setLoading(false);
  }, [search]);

  const timeline = data?.found ? buildTimeline(
    data.subscribed_sequences || [],
    data.broadcasts || [],
    data.subscriber?.created_at
  ) : [];

  const subscriber = data?.subscriber;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Mail className="w-4.5 h-4.5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-body text-sm font-bold text-slate-900">Subscriber Email History</h3>
          <p className="text-[11px] text-slate-400">Search any subscriber to see every email they received — broadcasts + sequence emails — in chronological order</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Enter subscriber email address..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !search.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-body font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 transition-colors"
        >
          {loading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-xs text-slate-400 font-body">Fetching email history from Kit...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Not found */}
      {data && !data.found && (
        <div className="text-center py-8">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-body">No subscriber found for <span className="font-semibold">{data.email}</span></p>
        </div>
      )}

      {/* Results */}
      {data?.found && subscriber && (
        <AnimatePresence mode="wait">
          <motion.div
            key={subscriber.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Subscriber info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-bold text-slate-900">
                    {subscriber.first_name || "Unknown"}
                    <span className="text-slate-400 font-normal ml-1.5">{subscriber.email_address}</span>
                  </p>
                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${subscriber.state === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {subscriber.state}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" /> Joined {formatTime(subscriber.created_at)}
                    </span>
                    {subscriber.tags?.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Tag className="w-3 h-3" /> {subscriber.tags.length} tags
                      </span>
                    )}
                  </div>
                  {subscriber.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {subscriber.tags.map(t => (
                        <span key={t.id} className="text-[9px] font-body px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Emails</p>
                <p className="text-lg font-body font-bold text-slate-900">{timeline.length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Broadcasts</p>
                <p className="text-lg font-body font-bold text-indigo-600">{timeline.filter(i => i.type === "broadcast").length}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Sequence Emails</p>
                <p className="text-lg font-body font-bold text-purple-600">{timeline.filter(i => i.type === "sequence").length}</p>
              </div>
            </div>

            {/* Subscribed sequences */}
            {data.subscribed_sequences?.length > 0 && (
              <div>
                <p className="text-xs font-body font-bold text-slate-700 mb-1.5 px-1">Active Sequences ({data.subscribed_sequences.length})</p>
                <div className="space-y-1.5">
                  {data.subscribed_sequences.map((seq, i) => {
                    const expanded = expandedSeq === seq.sequence_id;
                    return (
                      <div key={seq.sequence_id || i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedSeq(expanded ? null : seq.sequence_id)}
                          className="w-full flex items-center gap-2.5 p-2.5 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Layers className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-body font-semibold text-slate-900 truncate">{seq.sequence_name}</p>
                            <p className="text-[10px] text-slate-400">
                              Subscribed {formatTime(seq.subscribed_at)} · {seq.emails?.length || 0} emails
                              <span className={`ml-1.5 ${seq.state === "active" ? "text-emerald-600" : "text-slate-400"}`}>· {seq.state}</span>
                            </p>
                          </div>
                          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                        </button>
                        {expanded && seq.emails?.length > 0 && (
                          <div className="border-t border-slate-100 bg-slate-50 p-2 space-y-1">
                            {seq.emails
                              .sort((a, b) => (a.position || 0) - (b.position || 0))
                              .map((email, idx) => (
                                <div key={email.id || idx} className="flex items-center gap-2 text-[11px] bg-white rounded-md p-2 border border-slate-100">
                                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                                    {(email.position ?? idx) + 1}
                                  </span>
                                  <span className="text-slate-700 font-body truncate flex-1">{email.subject}</span>
                                  {!email.published && <span className="text-[9px] text-slate-400 italic">draft</span>}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs font-body font-bold text-slate-700 mb-1.5 px-1">Email Timeline ({timeline.length})</p>
              {timeline.length === 0 ? (
                <div className="text-center py-6">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-body">No emails sent to this subscriber yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {timeline.map((item, i) => {
                    const meta = TYPE_META[item.type];
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.5) }}
                        className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-lg p-2.5"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color.split(" ")[0]}`}>
                          <Icon className={`w-3.5 h-3.5 ${meta.color.split(" ")[1]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-body px-1.5 py-0.5 rounded-full border ${meta.color}`}>
                              {meta.label}
                            </span>
                            {item.sequence_name && (
                              <span className="text-[9px] font-body px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                                {item.sequence_name}
                                {item.position !== null && ` · #${item.position + 1}`}
                              </span>
                            )}
                            {item.is_estimated && (
                              <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> est.
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-body font-medium text-slate-900 mt-0.5 truncate">{item.subject}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatTime(item.date)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <p className="text-[10px] text-amber-700 font-body flex items-start gap-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>
                  Broadcasts are shown if sent after the subscriber joined Kit (broadcasts go to all/subset of subscribers).
                  Sequence email dates are estimated from subscription date + delay settings. Only sequences where the subscriber was found in the first 1,500 entries are shown.
                </span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}