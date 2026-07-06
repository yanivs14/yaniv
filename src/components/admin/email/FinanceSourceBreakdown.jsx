import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, CreditCard, GraduationCap, TrendingUp, Repeat, Zap, Percent, Users, DollarSign, Activity } from "lucide-react";

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(n) {
  if (!n || isNaN(n)) return "0%";
  return `${n.toFixed(1)}%`;
}

const SOURCE_META = {
  skool: { label: "Skool", icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50", bar: "#f59e0b" },
  stripe: { label: "Stripe / Site", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50", bar: "#6366f1" },
  quiz: { label: "Quiz Leads", icon: Users, color: "text-teal-600", bg: "bg-teal-50", bar: "#0d9488" },
  inner_circle: { label: "Inner Circle", icon: Globe, color: "text-blue-600", bg: "bg-blue-50", bar: "#3b82f6" },
  newsletter: { label: "Newsletter", icon: Activity, color: "text-purple-600", bg: "bg-purple-50", bar: "#8b5cf6" },
  hubspot: { label: "HubSpot", icon: Users, color: "text-orange-600", bg: "bg-orange-50", bar: "#f97316" },
};

export default function FinanceSourceBreakdown({ data }) {
  const contacts = data?.contacts || [];
  const financials = data?.financials || {};
  const stats = data?.stats || {};

  // Revenue by source — Skool vs Stripe vs other
  const sourceRevenue = useMemo(() => {
    const skoolRev = financials.skool_revenue || 0;
    const stripeRev = Math.max(0, (financials.total_revenue || 0) - skoolRev);
    const total = financials.total_revenue || 0;

    return [
      { key: "skool", label: "Skool", revenue: skoolRev, pct: total > 0 ? (skoolRev / total) * 100 : 0 },
      { key: "stripe", label: "Stripe / Site", revenue: stripeRev, pct: total > 0 ? (stripeRev / total) * 100 : 0 },
    ].filter(s => s.revenue > 0);
  }, [financials]);

  // Customer count + revenue by contact source
  const sourceStats = useMemo(() => {
    const map = {};
    contacts.forEach(c => {
      const src = c.source || "other";
      if (!map[src]) map[src] = { count: 0, paying: 0, churned: 0, revenue: 0, recurring: 0 };
      map[src].count += 1;
      if (c.is_paying_customer) map[src].paying += 1;
      if (c.is_churned) map[src].churned += 1;
      map[src].revenue += c.total_paid || 0;
      if (c.is_recurring) map[src].recurring += 1;
    });
    return Object.entries(map)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [contacts]);

  // One-time vs recurring
  const recurringSplit = useMemo(() => {
    let recurringRev = 0;
    let oneTimeRev = 0;
    contacts.forEach(c => {
      if (c.is_recurring) {
        recurringRev += c.total_paid || 0;
      } else {
        oneTimeRev += c.total_paid || 0;
      }
    });
    const total = recurringRev + oneTimeRev;
    return {
      recurring: recurringRev,
      oneTime: oneTimeRev,
      recurringPct: total > 0 ? (recurringRev / total) * 100 : 0,
      oneTimePct: total > 0 ? (oneTimeRev / total) * 100 : 0,
    };
  }, [contacts]);

  // Additional metrics
  const totalRefunded = financials.total_refunded || 0;
  const totalRevenue = financials.total_revenue || 0;
  const refundRate = totalRevenue > 0 ? (totalRefunded / (totalRevenue + totalRefunded)) * 100 : 0;
  const netRevenue = totalRevenue - totalRefunded;
  const activePaying = stats.paying_customers || 0;
  const churnedCount = stats.churned || 0;
  const avgTicket = activePaying > 0 ? totalRevenue / activePaying : 0;
  const ltvEstimate = activePaying > 0 ? totalRevenue / activePaying : 0;
  const activeRate = (activePaying + churnedCount) > 0 ? (activePaying / (activePaying + churnedCount)) * 100 : 0;

  const extraMetrics = [
    { label: "Recurring Revenue", value: formatMoney(recurringSplit.recurring), sub: formatPercent(recurringSplit.recurringPct) + " of total", icon: Repeat, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "One-Time Revenue", value: formatMoney(recurringSplit.oneTime), sub: formatPercent(recurringSplit.oneTimePct) + " of total", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Avg Ticket Size", value: formatMoney(avgTicket), sub: `${activePaying} paying customers`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Refund Rate", value: formatPercent(refundRate), sub: formatMoney(totalRefunded) + " refunded", icon: Percent, color: "text-red-500", bg: "bg-red-50" },
    { label: "Active Rate", value: formatPercent(activeRate), sub: `${activePaying} active · ${churnedCount} churned`, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Net Revenue", value: formatMoney(netRevenue), sub: "After refunds", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  if (sourceRevenue.length === 0 && sourceStats.length === 0) return null;

  return (
    <>
      {/* Revenue by source — Skool vs Stripe */}
      {sourceRevenue.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-body font-semibold text-slate-900 mb-3">Revenue by Source</p>
          <div className="space-y-3">
            {sourceRevenue.map((s, i) => {
              const meta = SOURCE_META[s.key] || SOURCE_META.stripe;
              const Icon = meta.icon;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <span className="text-sm font-body font-medium text-slate-700">{s.label}</span>
                      <span className="text-[10px] text-slate-400 font-body">{formatPercent(s.pct)}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-body">{formatMoney(s.revenue)}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contacts by source — table */}
      {sourceStats.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-body font-semibold text-slate-900 mb-3">Contacts & Revenue by Source</p>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1.5fr_0.6fr_0.6fr_0.6fr_0.8fr_0.8fr] gap-2 px-2 py-2 text-[10px] uppercase tracking-wide text-slate-400 font-body font-semibold border-b border-slate-200 bg-slate-50 rounded-t-lg min-w-[480px]">
              <span>Source</span>
              <span className="text-right">Total</span>
              <span className="text-right">Paying</span>
              <span className="text-right">Churned</span>
              <span className="text-right">Recurring</span>
              <span className="text-right">Revenue</span>
            </div>
            <div className="divide-y divide-slate-100 min-w-[480px]">
              {sourceStats.map(s => {
                const meta = SOURCE_META[s.key] || { label: s.key, icon: Globe, color: "text-slate-600", bg: "bg-slate-100", bar: "#94a3b8" };
                const Icon = meta.icon;
                return (
                  <div key={s.key} className="grid grid-cols-[1.5fr_0.6fr_0.6fr_0.6fr_0.8fr_0.8fr] gap-2 px-2 py-2.5 items-center text-sm font-body">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-md ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-3 h-3 ${meta.color}`} />
                      </div>
                      <span className="text-slate-700 font-medium truncate">{meta.label}</span>
                    </div>
                    <span className="text-right text-slate-600">{s.count}</span>
                    <span className="text-right text-emerald-600 font-medium">{s.paying}</span>
                    <span className="text-right text-red-500">{s.churned}</span>
                    <span className="text-right text-teal-600">{s.recurring}</span>
                    <span className="text-right font-bold text-slate-900">{formatMoney(s.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Additional metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
        {extraMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <p className="text-xs text-slate-500 font-body">{m.label}</p>
              </div>
              <p className="font-body text-xl font-bold text-slate-900 leading-none">{m.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{m.sub}</p>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}