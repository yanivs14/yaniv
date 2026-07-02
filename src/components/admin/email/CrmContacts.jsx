import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Crown, Users, UserMinus, TrendingUp, Mail, Phone, Globe,
  RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RotateCcw,
  CheckCircle2, XCircle, DollarSign,
} from "lucide-react";
import { fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm } from "@/lib/crmData";

const SOURCE_LABELS = {
  quiz: "Quiz",
  inner_circle: "Inner Circle",
  newsletter: "Newsletter",
  kit: "Kit",
  hubspot: "HubSpot",
  stripe: "Stripe",
};

const SOURCE_COLORS = {
  quiz: "bg-orange-red/15 text-orange-red border-orange-red/30",
  inner_circle: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  newsletter: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  kit: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  hubspot: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  stripe: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(n) {
  if (!n || n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CrmContacts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const crmData = await fetchCrmOnly();
      setData(crmData);
      setLoading(false);
      setStripeLoading(true);
      try {
        const stripeData = await fetchStripeOnly();
        setData(prev => prev ? mergeStripeIntoCrm({ ...prev }, stripeData) : prev);
      } catch (e) {
        console.error("Stripe enrich failed:", e);
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

  const activeCount = useMemo(() => contacts.filter(c => c.is_paying_customer && !c.is_churned).length, [contacts]);
  const pastCount = useMemo(() => contacts.filter(c => c.is_churned).length, [contacts]);
  const leadsCount = useMemo(() => contacts.filter(c => !c.is_paying_customer && !c.is_churned).length, [contacts]);
  const refundedCount = useMemo(() => contacts.filter(c => c.is_refunded).length, [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filter === "active" && !(c.is_paying_customer && !c.is_churned)) return false;
      if (filter === "past" && !c.is_churned) return false;
      if (filter === "leads" && (c.is_paying_customer || c.is_churned)) return false;
      if (filter === "refunded" && !c.is_refunded) return false;
      if (search) {
        const q = search.toLowerCase();
        return (c.email || "").toLowerCase().includes(q) ||
               (c.name || "").toLowerCase().includes(q) ||
               (c.phone || "").includes(q);
      }
      return true;
    });
  }, [contacts, search, filter]);

  useEffect(() => { setCurrentPage(1); }, [search, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const statCards = [
    { label: "Total", value: stats.total_contacts || 0, icon: Users, color: "text-off-white" },
    { label: "Active", value: activeCount, icon: CheckCircle2, color: "text-green-400" },
    { label: "Past", value: pastCount, icon: XCircle, color: "text-red-400" },
    { label: "Leads", value: leadsCount, icon: TrendingUp, color: "text-orange-red" },
    { label: "Refunded", value: refundedCount, icon: RotateCcw, color: "text-yellow-400" },
  ];

  const filterTabs = [
    { key: "all", label: "All", count: contacts.length },
    { key: "active", label: "Active", count: activeCount },
    { key: "past", label: "Past", count: pastCount },
    { key: "leads", label: "Leads", count: leadsCount },
    { key: "refunded", label: "Refunded", count: refundedCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-2.5 text-center">
              <Icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="font-heading text-xl font-bold text-off-white leading-none">{s.value}</p>
              <p className="text-[9px] text-white-muted mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Platform indicators */}
      <div className="flex items-center gap-3 mb-3 text-[10px] text-white-dim px-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Kit {stats.in_kit || 0}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> HubSpot {stats.in_hubspot || 0}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Emails {stats.total_emails_sent || 0}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Stripe {stats.in_stripe || 0}</span>
        <span className="ml-auto flex items-center gap-2">
          {stripeLoading && (
            <span className="flex items-center gap-1 text-[10px] text-orange-red">
              <div className="w-2.5 h-2.5 border border-orange-red border-t-transparent rounded-full animate-spin" />
              Loading Stripe…
            </span>
          )}
          <button onClick={loadData} className="text-white-muted hover:text-orange-red transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-dim" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
        {filterTabs.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${filter === f.key ? "bg-orange-red text-dark-bg border-orange-red" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red"}`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Contact table — desktop */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-white-dim mx-auto mb-3" />
          <p className="text-white-muted font-body text-sm">No contacts found</p>
        </div>
      ) : (
        <>
        {/* Desktop table */}
        <div className="hidden md:block bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1.8fr_2.5fr_0.8fr_1.5fr_0.7fr_0.9fr_0.4fr] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-white-dim font-body font-semibold border-b border-[#2a2a2a] bg-[#111]">
            <span>Name</span>
            <span>Email</span>
            <span>Source</span>
            <span>Plan</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Added</span>
            <span></span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-[#1a1a1a]">
            {pagedContacts.map((c, i) => {
              const expanded = expandedId === c.email;
              const statusColor = c.is_paying_customer ? "bg-green-500/20 text-green-400" : c.is_churned ? "bg-red-500/20 text-red-400" : "bg-[#1a1a1a] text-white-muted";
              return (
                <React.Fragment key={c.email + i}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : c.email)}
                    className={`w-full grid grid-cols-[1.8fr_2.5fr_0.8fr_1.5fr_0.7fr_0.9fr_0.4fr] gap-2 px-3 py-2 items-center text-left hover:bg-[#141414] transition-colors ${expanded ? "bg-[#141414]" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${statusColor}`}>
                        {(c.name || c.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-body font-semibold text-off-white truncate flex items-center gap-1">
                          {c.name || "Unknown"}
                          {c.is_paying_customer && <Crown className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {c.kit_id && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Kit" />}
                          {c.hubspot_id && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title="HubSpot" />}
                          {c.stripe_customer_id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="Stripe" />}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-white-muted font-body truncate">{c.email}</span>
                    <span className={`text-[10px] font-body px-1.5 py-0.5 rounded-full border inline-block w-fit ${SOURCE_COLORS[c.source] || SOURCE_COLORS.quiz}`}>
                      {SOURCE_LABELS[c.source] || c.source}
                    </span>
                    <span className="text-[11px] text-orange-red font-body truncate">{c.purchase_plan || "—"}</span>
                    <span className="text-xs text-green-400 font-body text-right font-semibold">{formatMoney(c.total_paid)}</span>
                    <span className="text-[11px] text-white-dim font-body text-right">{formatDate(c.created_date)}</span>
                    <span className="flex justify-end">
                      {expanded ? <ChevronUp className="w-3.5 h-3.5 text-white-dim" /> : <ChevronDown className="w-3.5 h-3.5 text-white-dim" />}
                    </span>
                  </button>
                  {expanded && (
                    <div className="px-3 py-3 bg-[#0a0a0a] grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs font-body">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-white-muted"><Phone className="w-3 h-3 text-white-dim" /> {c.phone}</div>
                      )}
                      {c.country && (
                        <div className="flex items-center gap-1.5 text-white-muted"><Globe className="w-3 h-3 text-white-dim" /> {c.country}{c.language ? ` · ${c.language}` : ""}</div>
                      )}
                      {c.quiz_recommendation && (
                        <div className="text-white-muted col-span-2"><span className="text-white-dim">Quiz:</span> {c.quiz_recommendation}</div>
                      )}
                      {c.kit_lifecycle && (
                        <div className="text-white-muted"><span className="text-white-dim">Kit:</span> {c.kit_lifecycle}</div>
                      )}
                      {c.hubspot_lifecycle && (
                        <div className="text-white-muted"><span className="text-white-dim">HubSpot:</span> {c.hubspot_lifecycle}</div>
                      )}
                      {c.subscription_status && (
                        <div className="text-white-muted"><span className="text-white-dim">Sub:</span> {c.subscription_status}</div>
                      )}
                      {c.first_payment_date && (
                        <div className="text-white-muted"><span className="text-white-dim">First pay:</span> {formatDate(c.first_payment_date)}</div>
                      )}
                      {c.last_payment_date && (
                        <div className="text-white-muted"><span className="text-white-dim">Last pay:</span> {formatDate(c.last_payment_date)}</div>
                      )}
                      {c.subscription_canceled && (
                        <div className="text-red-400"><span className="text-white-dim">Canceled:</span> {formatDate(c.subscription_canceled)}</div>
                      )}
                      {c.total_paid > 0 && (
                        <div className="text-white-muted"><span className="text-white-dim">Total:</span> <span className="text-green-400 font-semibold">${c.total_paid.toFixed(2)}</span>
                          {c.total_refunded > 0 && <span className="text-yellow-400"> · Ref: ${c.total_refunded.toFixed(2)}</span>}
                        </div>
                      )}
                      {c.last_email_date && (
                        <div className="text-white-muted"><span className="text-white-dim">Last email:</span> {formatDate(c.last_email_date)}</div>
                      )}
                      {c.emails_sent > 0 && (
                        <div className="text-white-muted flex items-center gap-1"><Mail className="w-3 h-3 text-white-dim" /> {c.emails_sent} sent</div>
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
            const statusColor = c.is_paying_customer ? "bg-green-500/20 text-green-400" : c.is_churned ? "bg-red-500/20 text-red-400" : "bg-[#1a1a1a] text-white-muted";
            return (
              <div key={c.email + i} className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedId(expanded ? null : c.email)} className="w-full text-left p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${statusColor}`}>
                      {(c.name || c.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-body font-semibold text-off-white truncate">{c.name || "Unknown"}</p>
                        {c.is_paying_customer && <Crown className="w-3 h-3 text-green-400" />}
                        {c.is_churned && <span className="text-[10px] text-red-400">Churned</span>}
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${SOURCE_COLORS[c.source] || SOURCE_COLORS.quiz}`}>
                          {SOURCE_LABELS[c.source] || c.source}
                        </span>
                      </div>
                      <p className="text-xs text-white-muted truncate">{c.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {c.purchase_plan && <span className="text-[10px] text-orange-red truncate max-w-[140px]">{c.purchase_plan}</span>}
                        {c.total_paid > 0 && <span className="text-[10px] text-green-400 font-semibold">${c.total_paid.toFixed(0)}</span>}
                      </div>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-white-dim flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-white-dim flex-shrink-0 mt-1" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-[#2a2a2a] p-3 space-y-1.5 bg-[#0d0d0d] text-xs text-white-muted">
                    {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white-dim" /> {c.phone}</div>}
                    {c.country && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-white-dim" /> {c.country}{c.language ? ` · ${c.language}` : ""}</div>}
                    {c.quiz_recommendation && <div><span className="text-white-dim">Quiz:</span> {c.quiz_recommendation}</div>}
                    {c.kit_lifecycle && <div><span className="text-white-dim">Kit:</span> {c.kit_lifecycle}</div>}
                    {c.hubspot_lifecycle && <div><span className="text-white-dim">HubSpot:</span> {c.hubspot_lifecycle}</div>}
                    {c.subscription_status && <div><span className="text-white-dim">Sub:</span> {c.subscription_status}</div>}
                    {c.first_payment_date && <div><span className="text-white-dim">First pay:</span> {formatDate(c.first_payment_date)}</div>}
                    {c.last_payment_date && <div><span className="text-white-dim">Last pay:</span> {formatDate(c.last_payment_date)}</div>}
                    {c.subscription_canceled && <div className="text-red-400"><span className="text-white-dim">Canceled:</span> {formatDate(c.subscription_canceled)}</div>}
                    {c.total_paid > 0 && <div><span className="text-white-dim">Total:</span> <span className="text-green-400 font-semibold">${c.total_paid.toFixed(2)}</span>{c.total_refunded > 0 && <span className="text-yellow-400"> · Ref: ${c.total_refunded.toFixed(2)}</span>}</div>}
                    {c.last_email_date && <div><span className="text-white-dim">Last email:</span> {formatDate(c.last_email_date)}</div>}
                    <div className="text-white-dim">Added: {formatDate(c.created_date)}</div>
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
              className="flex items-center gap-1 text-xs font-body px-3 py-2 rounded-lg border border-[#2a2a2a] text-white-muted hover:border-orange-red hover:text-orange-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-white-dim text-xs px-1">…</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-xs font-body rounded-lg transition-colors ${currentPage === p ? "bg-orange-red text-dark-bg font-bold" : "text-white-muted hover:bg-[#1a1a1a]"}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-xs font-body px-3 py-2 rounded-lg border border-[#2a2a2a] text-white-muted hover:border-orange-red hover:text-orange-red transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-center text-[10px] text-white-dim mt-2 mb-1">
          Page {currentPage} of {totalPages} · {filtered.length} contacts
        </p>
        </>
      )}
    </div>
  );
}