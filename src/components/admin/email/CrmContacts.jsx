import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Crown, Users, UserMinus, TrendingUp, Mail, Phone, Globe, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
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

export default function CrmContacts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const crmData = await fetchCrmOnly();
      setData(crmData);
      setLoading(false);
      // Phase 2: enrich with Stripe data
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

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filter === "customers" && !c.is_paying_customer) return false;
      if (filter === "leads" && (c.is_paying_customer || c.is_churned)) return false;
      if (filter === "churned" && !c.is_churned) return false;
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

  // Reset to page 1 when filter/search changes
  useEffect(() => { setCurrentPage(1); }, [search, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const statCards = [
    { label: "Total", value: stats.total_contacts || 0, icon: Users, color: "text-off-white" },
    { label: "Customers", value: stats.paying_customers || 0, icon: Crown, color: "text-green-400" },
    { label: "Leads", value: stats.leads || 0, icon: TrendingUp, color: "text-orange-red" },
    { label: "Churned", value: stats.churned || 0, icon: UserMinus, color: "text-red-400" },
    { label: "Refunded", value: stats.refunded || 0, icon: RotateCcw, color: "text-yellow-400" },
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
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: "none" }}>
        {[
          { key: "all", label: `All`, count: contacts.length },
          { key: "customers", label: `Customers`, count: stats.paying_customers || 0 },
          { key: "leads", label: `Leads`, count: stats.leads || 0 },
          { key: "churned", label: `Churned`, count: stats.churned || 0 },
          { key: "refunded", label: `Refunded`, count: stats.refunded || 0 },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${filter === f.key ? "bg-orange-red text-dark-bg border-orange-red" : "bg-[#1a1a1a] text-white-muted border-[#2a2a2a] hover:border-orange-red"}`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-white-dim mx-auto mb-3" />
          <p className="text-white-muted font-body text-sm">No contacts found</p>
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {pagedContacts.map((c, i) => {
            const expanded = expandedId === c.email;
            return (
              <motion.div
                key={c.email + i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.3) }}
                className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-colors"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : c.email)}
                  className="w-full text-left p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${c.is_paying_customer ? "bg-green-500/20 text-green-400" : c.is_churned ? "bg-red-500/20 text-red-400" : "bg-[#1a1a1a] text-white-muted"}`}>
                      {(c.name || c.email || "?")[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-body font-semibold text-off-white truncate">
                          {c.name || "Unknown"}
                        </p>
                        {c.is_paying_customer && (
                          <span className="flex items-center gap-1 text-[10px] font-body px-2 py-0.5 rounded-full border bg-green-500/15 text-green-400 border-green-500/30">
                            <Crown className="w-2.5 h-2.5" /> Customer
                          </span>
                        )}
                        {c.is_churned && (
                          <span className="text-[10px] font-body px-2 py-0.5 rounded-full border bg-red-500/15 text-red-400 border-red-500/30">
                            Churned
                          </span>
                        )}
                        {c.is_refunded && (
                          <span className="text-[10px] font-body px-2 py-0.5 rounded-full border bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
                            Refunded
                          </span>
                        )}
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${SOURCE_COLORS[c.source] || SOURCE_COLORS.quiz}`}>
                          {SOURCE_LABELS[c.source] || c.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-white-dim flex-shrink-0" />
                        <p className="text-xs text-white-muted truncate">{c.email}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {c.kit_id && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Kit
                          </span>
                        )}
                        {c.hubspot_id && (
                          <span className="flex items-center gap-1 text-[10px] text-orange-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> HubSpot
                          </span>
                        )}
                        {c.emails_sent > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-green-400">
                            <Mail className="w-2.5 h-2.5" /> {c.emails_sent}
                          </span>
                        )}
                        {c.purchase_plan && (
                          <span className="text-[10px] text-orange-red truncate max-w-[120px]">{c.purchase_plan}</span>
                        )}
                      </div>
                    </div>

                    {expanded ? <ChevronUp className="w-4 h-4 text-white-dim flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-white-dim flex-shrink-0 mt-1" />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-[#2a2a2a] p-3 space-y-1.5 bg-[#0d0d0d]">
                    {c.phone && (
                      <div className="flex items-center gap-2 text-xs text-white-muted">
                        <Phone className="w-3.5 h-3.5 text-white-dim" /> {c.phone}
                      </div>
                    )}
                    {c.country && (
                      <div className="flex items-center gap-2 text-xs text-white-muted">
                        <Globe className="w-3.5 h-3.5 text-white-dim" /> {c.country}{c.language ? ` · ${c.language}` : ""}
                      </div>
                    )}
                    {c.quiz_recommendation && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Quiz rec:</span> {c.quiz_recommendation}
                      </div>
                    )}
                    {c.kit_lifecycle && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Kit lifecycle:</span> {c.kit_lifecycle}
                      </div>
                    )}
                    {c.hubspot_lifecycle && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">HubSpot lifecycle:</span> {c.hubspot_lifecycle}
                      </div>
                    )}
                    {c.purchase_plan && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Plan:</span> <span className="text-orange-red font-medium">{c.purchase_plan}</span>
                      </div>
                    )}
                    {c.subscription_status && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Subscription:</span> {c.subscription_status}
                      </div>
                    )}
                    {c.first_payment_date && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">First payment:</span> {formatDate(c.first_payment_date)}
                      </div>
                    )}
                    {c.last_payment_date && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Last payment:</span> {formatDate(c.last_payment_date)}
                      </div>
                    )}
                    {c.subscription_canceled && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Canceled:</span> <span className="text-red-400">{formatDate(c.subscription_canceled)}</span>
                      </div>
                    )}
                    {c.total_paid > 0 && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Total paid:</span> ${c.total_paid.toFixed(2)}
                        {c.total_refunded > 0 && <span className="text-yellow-400"> · Refunded: ${c.total_refunded.toFixed(2)}</span>}
                      </div>
                    )}
                    {c.last_email_date && (
                      <div className="text-xs text-white-muted">
                        <span className="text-white-dim">Last email:</span> {formatDate(c.last_email_date)}
                      </div>
                    )}
                    <div className="text-xs text-white-dim">
                      Added: {formatDate(c.created_date)}
                    </div>
                  </div>
                )}
              </motion.div>
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
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-white-dim text-xs px-1">…</span>
                    )}
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