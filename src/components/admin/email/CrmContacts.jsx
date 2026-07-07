import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Crown, Users, UserMinus, TrendingUp, Mail, Phone, Globe,
  RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RotateCcw,
  CheckCircle2, XCircle, DollarSign, Ban, Calendar, Repeat, CreditCard,
} from "lucide-react";
import StripeActionModal from "@/components/admin/email/StripeActionModal";
import UpcomingMeetingsBanner from "@/components/admin/email/UpcomingMeetingsBanner";
import { fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm, clearCrmCache, getCachedAt } from "@/lib/crmData";
import CacheTimestamp from "@/components/admin/email/CacheTimestamp";

const SOURCE_LABELS = {
  quiz: "Quiz",
  inner_circle: "Inner Circle",
  newsletter: "Newsletter",
  kit: "Kit",
  hubspot: "HubSpot",
  stripe: "Stripe",
};

const SOURCE_COLORS = {
  quiz: "bg-teal-50 text-teal-700 border-teal-200",
  inner_circle: "bg-blue-50 text-blue-700 border-blue-200",
  newsletter: "bg-purple-50 text-purple-700 border-purple-200",
  kit: "bg-amber-50 text-amber-700 border-amber-200",
  hubspot: "bg-orange-50 text-orange-700 border-orange-200",
  stripe: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr) {
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

function formatDateTimeShort(dateStr) {
  if (!dateStr) return "—";
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthKey(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function formatMoney(n) {
  if (!n || n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CrmContacts({ meetingsMap, loadingMeetings, onGoToCalendly }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stripeAction, setStripeAction] = useState(null);
  const [copyToast, setCopyToast] = useState(null);
  const [cachedAt, setCachedAt] = useState(getCachedAt());
  const pageSize = 50;

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      const id = Date.now();
      setCopyToast({ id, text });
      setTimeout(() => {
        setCopyToast(prev => prev?.id === id ? null : prev);
      }, 1500);
    });
  };

  const loadData = useCallback(async (force = false) => {
    if (force) clearCrmCache();
    setLoading(true);
    try {
      const crmData = await fetchCrmOnly(force);
      setCachedAt(getCachedAt());
      // Keep previous data (including Stripe-enriched contacts) visible during refresh
      // until the new Stripe data arrives — prevents Stripe-only contacts from disappearing
      setData(prev => prev || crmData);
      setLoading(false);
      setStripeLoading(true);
      try {
        const stripeData = await fetchStripeOnly(null, force);
        setData(mergeStripeIntoCrm({ ...crmData }, stripeData));
      } catch (e) {
        console.error("Stripe enrich failed:", e);
        setData(crmData);
      }
      setStripeLoading(false);
    } catch (e) {
      console.error("CRM load failed:", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const contacts = data?.contacts || [];
  const stats = data?.stats || {};

  // Subset after source + search filter (but before status filter) so pill counts reflect the selected source
  const sourceFiltered = useMemo(() => {
    return contacts.filter(c => {
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (c.email || "").toLowerCase().includes(q) ||
               (c.name || "").toLowerCase().includes(q) ||
               (c.phone || "").includes(q);
      }
      return true;
    });
  }, [contacts, search, sourceFilter]);

  const activeCount = useMemo(() => sourceFiltered.filter(c => c.is_paying_customer && !c.is_churned).length, [sourceFiltered]);
  const payingCount = useMemo(() => sourceFiltered.filter(c => c.is_paying_customer).length, [sourceFiltered]);
  const pastCount = useMemo(() => sourceFiltered.filter(c => c.is_churned).length, [sourceFiltered]);
  const leadsCount = useMemo(() => sourceFiltered.filter(c => !c.is_paying_customer && !c.is_churned).length, [sourceFiltered]);
  const refundedCount = useMemo(() => sourceFiltered.filter(c => c.is_refunded).length, [sourceFiltered]);

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filter === "active" && !(c.is_paying_customer && !c.is_churned)) return false;
      if (filter === "paying" && !c.is_paying_customer) return false;
      if (filter === "past" && !c.is_churned) return false;
      if (filter === "leads" && (c.is_paying_customer || c.is_churned)) return false;
      if (filter === "refunded" && !c.is_refunded) return false;
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (c.email || "").toLowerCase().includes(q) ||
               (c.name || "").toLowerCase().includes(q) ||
               (c.phone || "").includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const da = a.created_date ? new Date(a.created_date).getTime() : 0;
      const db = b.created_date ? new Date(b.created_date).getTime() : 0;
      return db - da;
    });
  }, [contacts, search, filter, sourceFilter]);

  useEffect(() => { setCurrentPage(1); }, [search, filter, sourceFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const filterTabs = [
    { key: "all", label: "All", count: sourceFiltered.length },
    { key: "active", label: "Active", count: activeCount },
    { key: "paying", label: "Paying", count: payingCount },
    { key: "past", label: "Past", count: pastCount },
    { key: "leads", label: "Leads", count: leadsCount },
    { key: "refunded", label: "Refunded", count: refundedCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Upcoming meetings alert */}
      <UpcomingMeetingsBanner meetingsMap={meetingsMap} onViewAll={onGoToCalendly} />

      {/* Platform indicators */}
      <div className="flex items-center gap-3 mb-3 text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Kit {stats.in_kit || 0}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> HubSpot {stats.in_hubspot || 0}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Emails {stats.total_emails_sent || 0}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Stripe {stats.in_stripe || 0}</span>
        <span className="ml-auto flex items-center gap-2">
          {stripeLoading && (
            <span className="flex items-center gap-1 text-xs text-teal-600">
              <div className="w-2.5 h-2.5 border border-teal-600 border-t-transparent rounded-full animate-spin" />
              Loading Stripe…
            </span>
          )}
          <CacheTimestamp cachedAt={cachedAt} />
          <button onClick={() => { loadData(true); setCachedAt(getCachedAt()); }} className="text-slate-400 hover:text-teal-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
        />
      </div>

      {/* Source filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setSourceFilter("all")}
          className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === "all" ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
        >
          All Sources
        </button>
        {Object.entries(SOURCE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSourceFilter(key)}
            className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === key ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
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

      {/* Contact table — desktop */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-body text-sm">No contacts found</p>
        </div>
      ) : (
        <>
        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[1.8fr_2.5fr_0.8fr_1.5fr_0.7fr_0.9fr_0.4fr] gap-2 px-3 py-2.5 text-xs uppercase tracking-wide text-slate-500 font-body font-semibold border-b border-slate-200 bg-slate-50">
            <span>Name</span>
            <span>Email</span>
            <span>Source</span>
            <span>Plan</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Added</span>
            <span></span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {pagedContacts.map((c, i) => {
              const expanded = expandedId === c.email;
              const statusColor = c.is_paying_customer ? "bg-emerald-100 text-emerald-700" : c.is_churned ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600";
              return (
                <React.Fragment key={c.email + i}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : c.email)}
                    className={`w-full grid grid-cols-[1.8fr_2.5fr_0.8fr_1.5fr_0.7fr_0.9fr_0.4fr] gap-2 px-3 py-2.5 items-center text-left hover:bg-slate-50 transition-colors ${expanded ? "bg-teal-50/30" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${statusColor}`}>
                        {(c.name || c.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p
                          onClick={(e) => copyToClipboard(e, c.name || "Unknown")}
                          className="text-sm font-body font-semibold text-slate-900 truncate flex items-center gap-1 cursor-pointer hover:text-teal-600 transition-colors"
                        >
                          {c.name || "Unknown"}
                          {c.is_paying_customer && <Crown className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                          {c.is_refunded && <span className="text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 flex-shrink-0">REFUNDED</span>}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {c.kit_id && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Kit" />}
                          {c.hubspot_id && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="HubSpot" />}
                          {c.stripe_customer_id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Stripe" />}
                        </div>
                      </div>
                    </div>
                    <span
                      onClick={(e) => copyToClipboard(e, c.email)}
                      className="text-sm text-slate-600 font-body truncate cursor-pointer hover:text-teal-600 transition-colors"
                    >
                      {c.email}
                    </span>
                    <span className={`text-xs font-body px-2 py-0.5 rounded-full border inline-block w-fit ${SOURCE_COLORS[c.source] || SOURCE_COLORS.quiz}`}>
                      {SOURCE_LABELS[c.source] || c.source}
                    </span>
                    <span className="text-sm text-teal-600 font-body truncate">{c.purchase_plan || "—"}</span>
                    <span className="text-sm text-emerald-600 font-body text-right font-semibold">{formatMoney(c.total_paid)}</span>
                    <span className="text-xs text-slate-400 font-body text-right whitespace-nowrap">{formatDateTimeShort(c.created_date)}</span>
                    <span className="flex justify-end">
                      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </span>
                  </button>
                  {expanded && (
                    <div className="px-3 py-3 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm font-body">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3 h-3 text-slate-400" /> {c.phone}</div>
                      )}
                      {c.country && (
                        <div className="flex items-center gap-1.5 text-slate-600"><Globe className="w-3 h-3 text-slate-400" /> {c.country}{c.language ? ` · ${c.language}` : ""}</div>
                      )}
                      {c.quiz_recommendation && (
                        <div className="text-slate-600 col-span-2"><span className="text-slate-400">Quiz:</span> {c.quiz_recommendation}</div>
                      )}
                      {c.kit_lifecycle && (
                        <div className="text-slate-600"><span className="text-slate-400">Kit:</span> {c.kit_lifecycle}</div>
                      )}
                      {c.hubspot_lifecycle && (
                        <div className="text-slate-600"><span className="text-slate-400">HubSpot:</span> {c.hubspot_lifecycle}</div>
                      )}
                      {c.subscription_status && (
                        <div className="text-slate-600"><span className="text-slate-400">Sub:</span> {c.subscription_status}</div>
                      )}
                      {c.first_payment_date && (
                        <div className="text-slate-600"><span className="text-slate-400">First pay:</span> {formatDateTime(c.first_payment_date)}</div>
                      )}
                      {c.last_payment_date && (
                        <div className="text-slate-600"><span className="text-slate-400">Last pay:</span> {formatDateTime(c.last_payment_date)}</div>
                      )}
                      {c.subscription_canceled && (
                        <div className="text-red-500"><span className="text-slate-400">Canceled:</span> {formatDateTime(c.subscription_canceled)}</div>
                      )}
                      {c.is_refunded && (
                        <div className="text-red-600"><span className="text-slate-400">Refunded:</span> ${c.total_refunded?.toFixed(2) || 0}</div>
                      )}
                      {c.total_paid > 0 && (
                        <div className="text-slate-600"><span className="text-slate-400">Total:</span> <span className="text-emerald-600 font-semibold">${c.total_paid.toFixed(2)}</span>
                          {c.total_refunded > 0 && <span className="text-amber-600"> · Ref: ${c.total_refunded.toFixed(2)}</span>}
                        </div>
                      )}
                      {c.last_email_date && (
                        <div className="text-slate-600"><span className="text-slate-400">Last email:</span> {formatDateTime(c.last_email_date)}</div>
                      )}
                      {c.emails_sent > 0 && (
                        <div className="text-slate-600 flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {c.emails_sent} sent</div>
                      )}
                      {c.created_date && (
                        <div className="text-slate-600"><span className="text-slate-400">Added:</span> {formatDateTime(c.created_date)}</div>
                      )}
                      {c.payment_months?.length > 0 && (
                        <div className="col-span-2 md:col-span-4 mt-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Repeat className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-400 text-xs">Subscription:</span>
                            <span className={`text-xs font-semibold ${c.is_recurring ? "text-teal-600" : "text-slate-600"}`}>
                              {c.is_recurring ? "Recurring" : "One-time"}
                            </span>
                            <span className="text-slate-300">·</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-600 text-xs">
                              {c.payment_months.length} {c.payment_months.length === 1 ? "month" : "months"} paid
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {c.payment_months.map(m => (
                              <span key={m} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                {formatMonthKey(m)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.stripe_customer_id && (
                        <div className="flex items-center gap-2 col-span-2 md:col-span-4 mt-2 pt-2 border-t border-slate-200">
                          {c.is_paying_customer && !c.is_churned && (
                            <button
                              onClick={() => setStripeAction({ contact: c, action: 'cancel' })}
                              className="flex items-center gap-1.5 text-[11px] font-body text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg px-2.5 py-1.5 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cancel Subscription
                            </button>
                          )}
                          {c.total_paid > 0 && (
                            <button
                              onClick={() => setStripeAction({ contact: c, action: 'refund' })}
                              className="flex items-center gap-1.5 text-[11px] font-body text-amber-600 hover:text-amber-700 border border-amber-300 hover:border-amber-400 rounded-lg px-2.5 py-1.5 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Refund Payment
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {pagedContacts.map((c, i) => {
            const expanded = expandedId === c.email;
            const statusColor = c.is_paying_customer ? "bg-emerald-100 text-emerald-700" : c.is_churned ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600";
            return (
              <div key={c.email + i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setExpandedId(expanded ? null : c.email)} className="w-full text-left p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${statusColor}`}>
                      {(c.name || c.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(e, c.name || "Unknown"); }}
                          className="text-sm font-body font-semibold text-slate-900 truncate cursor-pointer hover:text-teal-600 transition-colors"
                        >
                          {c.name || "Unknown"}
                        </p>
                        {c.is_paying_customer && <Crown className="w-3 h-3 text-emerald-500" />}
                        {c.is_churned && <span className="text-[10px] text-red-500">Churned</span>}
                        {c.is_refunded && <span className="text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">REFUNDED</span>}
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${SOURCE_COLORS[c.source] || SOURCE_COLORS.quiz}`}>
                          {SOURCE_LABELS[c.source] || c.source}
                        </span>
                      </div>
                      <p
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(e, c.email); }}
                        className="text-xs text-slate-500 truncate cursor-pointer hover:text-teal-600 transition-colors"
                      >
                        {c.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {c.purchase_plan && <span className="text-[10px] text-teal-600 truncate max-w-[140px]">{c.purchase_plan}</span>}
                        {c.total_paid > 0 && <span className="text-[10px] text-emerald-600 font-semibold">${c.total_paid.toFixed(0)}</span>}
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDateTimeShort(c.created_date)}</span>
                      </div>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-slate-200 p-3 space-y-1.5 bg-slate-50 text-xs text-slate-600">
                    {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}</div>}
                    {c.country && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-400" /> {c.country}{c.language ? ` · ${c.language}` : ""}</div>}
                    {c.quiz_recommendation && <div><span className="text-slate-400">Quiz:</span> {c.quiz_recommendation}</div>}
                    {c.kit_lifecycle && <div><span className="text-slate-400">Kit:</span> {c.kit_lifecycle}</div>}
                    {c.hubspot_lifecycle && <div><span className="text-slate-400">HubSpot:</span> {c.hubspot_lifecycle}</div>}
                    {c.subscription_status && <div><span className="text-slate-400">Sub:</span> {c.subscription_status}</div>}
                    {c.first_payment_date && <div><span className="text-slate-400">First pay:</span> {formatDateTime(c.first_payment_date)}</div>}
                    {c.last_payment_date && <div><span className="text-slate-400">Last pay:</span> {formatDateTime(c.last_payment_date)}</div>}
                    {c.subscription_canceled && <div className="text-red-500"><span className="text-slate-400">Canceled:</span> {formatDateTime(c.subscription_canceled)}</div>}
                    {c.is_refunded && <div className="text-red-600"><span className="text-slate-400">Refunded:</span> ${c.total_refunded?.toFixed(2) || 0}</div>}
                    {c.total_paid > 0 && <div><span className="text-slate-400">Total:</span> <span className="text-emerald-600 font-semibold">${c.total_paid.toFixed(2)}</span>{c.total_refunded > 0 && <span className="text-amber-600"> · Ref: ${c.total_refunded.toFixed(2)}</span>}</div>}
                    {c.last_email_date && <div><span className="text-slate-400">Last email:</span> {formatDateTime(c.last_email_date)}</div>}
                    <div className="text-slate-400">Added: {formatDateTime(c.created_date)}</div>
                    {c.payment_months?.length > 0 && (
                      <div className="pt-2 mt-1 border-t border-slate-200">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Repeat className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Subscription:</span>
                          <span className={`font-semibold ${c.is_recurring ? "text-teal-600" : "text-slate-600"}`}>
                            {c.is_recurring ? "Recurring" : "One-time"}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600">{c.payment_months.length} {c.payment_months.length === 1 ? "month" : "months"} paid</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.payment_months.map(m => (
                            <span key={m} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                              {formatMonthKey(m)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {c.stripe_customer_id && (
                      <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-200">
                        {c.is_paying_customer && !c.is_churned && (
                          <button
                            onClick={() => setStripeAction({ contact: c, action: 'cancel' })}
                            className="flex items-center gap-1.5 text-[11px] font-body text-red-600 border border-red-300 rounded-lg px-2.5 py-1.5"
                          >
                            <Ban className="w-3.5 h-3.5" /> Cancel Sub
                          </button>
                        )}
                        {c.total_paid > 0 && (
                          <button
                            onClick={() => setStripeAction({ contact: c, action: 'refund' })}
                            className="flex items-center gap-1.5 text-[11px] font-body text-amber-600 border border-amber-300 rounded-lg px-2.5 py-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Refund
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 mt-4 mb-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 text-xs font-body px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-400 text-xs px-1">…</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-xs font-body rounded-lg transition-colors ${currentPage === p ? "bg-teal-600 text-white font-bold" : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-xs font-body px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-center text-[10px] text-slate-400 mt-2 mb-1">
          Page {currentPage} of {totalPages} · {filtered.length} contacts
        </p>
        </>
      )}

      {stripeAction && (
        <StripeActionModal
          contact={stripeAction.contact}
          action={stripeAction.action}
          onClose={() => setStripeAction(null)}
          onSuccess={() => { setStripeAction(null); loadData(true); }}
        />
      )}

      {copyToast && (
        <AnimatePresence>
          <motion.div
            key={copyToast.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-slate-900/95 backdrop-blur-sm text-white px-3.5 py-2 rounded-full shadow-lg"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span className="text-xs font-medium truncate max-w-[200px]">{copyToast.text}</span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}