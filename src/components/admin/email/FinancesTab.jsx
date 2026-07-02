import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, Crown, RotateCcw, Activity, Calendar } from "lucide-react";
import { fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm } from "@/lib/crmData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMoneyDetailed(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}`;
}

const PLAN_COLORS = [
  "#00fff7", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

export default function FinancesTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

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
      console.error("Finances load failed:", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const financials = data?.financials || {};
  const stats = data?.stats || {};
  const monthlyData = Object.entries(financials.monthly_data || {}).map(([key, val]) => ({
    month: monthLabel(key),
    revenue: Math.round(val.revenue),
    transactions: val.transactions,
  }));
  const planBreakdown = Object.entries(financials.plan_breakdown || {})
    .sort((a, b) => b[1] - a[1]);

  const revenueChange = financials.last_month_revenue > 0
    ? ((financials.this_month_revenue - financials.last_month_revenue) / financials.last_month_revenue) * 100
    : 0;

  const mainCards = [
    { label: "Revenue This Month", value: formatMoney(financials.this_month_revenue), sub: `${financials.this_month_transactions || 0} transactions`, icon: DollarSign, color: "text-green-400", change: revenueChange },
    { label: "Last Month", value: formatMoney(financials.last_month_revenue), sub: `${financials.last_month_transactions || 0} transactions`, icon: Calendar, color: "text-blue-400" },
    { label: "MRR", value: formatMoney(financials.mrr), sub: "Monthly recurring", icon: Activity, color: "text-orange-red" },
    { label: "Avg Revenue / Customer", value: formatMoney(financials.arpu), sub: `${stats.paying_customers || 0} customers`, icon: TrendingUp, color: "text-purple-400" },
    { label: "Total Revenue", value: formatMoney(financials.total_revenue), sub: "All time", icon: Crown, color: "text-amber-400" },
    { label: "Total Refunded", value: formatMoney(financials.total_refunded), sub: `${stats.refunded || 0} customers`, icon: RotateCcw, color: "text-red-400" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base font-bold text-off-white uppercase tracking-tight">Financial Overview</h2>
        <span className="flex items-center gap-2">
          {stripeLoading && (
            <span className="flex items-center gap-1 text-[10px] text-orange-red">
              <div className="w-3 h-3 border border-orange-red border-t-transparent rounded-full animate-spin" />
              Loading Stripe…
            </span>
          )}
          <button onClick={loadData} className="text-white-muted hover:text-orange-red transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </span>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {mainCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <p className="text-[10px] text-white-muted font-body">{s.label}</p>
                {s.change !== undefined && s.change !== 0 && (
                  <span className={`ml-auto text-[10px] font-bold flex items-center gap-0.5 ${s.change > 0 ? "text-green-400" : "text-red-400"}`}>
                    {s.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(s.change).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="font-heading text-xl font-bold text-off-white leading-none">{s.value}</p>
              <p className="text-[9px] text-white-dim mt-1">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue chart */}
      {monthlyData.length > 0 && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 mb-4">
          <p className="text-xs font-body font-semibold text-off-white mb-3">Revenue — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 10 }} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                cursor={{ fill: "rgba(0,255,247,0.05)" }}
                contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#C8C8C8" }}
                formatter={(value, name) => [name === "revenue" ? formatMoneyDetailed(value) : value, name === "revenue" ? "Revenue" : "Transactions"]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {monthlyData.map((_, idx) => (
                  <Cell key={idx} fill={idx === monthlyData.length - 1 ? "#00fff7" : "#1a4a48"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Plan breakdown */}
      {planBreakdown.length > 0 && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 mb-4">
          <p className="text-xs font-body font-semibold text-off-white mb-3">Customers by Plan</p>
          <div className="space-y-2.5">
            {planBreakdown.map(([plan, count], idx) => {
              const maxCount = planBreakdown[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white-muted font-body truncate pr-2">{plan}</span>
                    <span className="text-[11px] font-bold text-off-white flex-shrink-0">{count}</span>
                  </div>
                  <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: PLAN_COLORS[idx % PLAN_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
        <p className="text-xs font-body font-semibold text-off-white mb-3">Key Metrics</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-white-dim">Churn Rate</p>
            <p className="text-sm font-bold text-red-400">{(financials.churn_rate || 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-white-dim">Paying Customers</p>
            <p className="text-sm font-bold text-green-400">{stats.paying_customers || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-white-dim">Churned</p>
            <p className="text-sm font-bold text-red-400">{stats.churned || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-white-dim">Net Revenue</p>
            <p className="text-sm font-bold text-orange-red">{formatMoney((financials.total_revenue || 0) - (financials.total_refunded || 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}