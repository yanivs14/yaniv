import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, Wallet, Receipt, CreditCard, ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Line, ComposedChart, CartesianGrid } from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMoney(n) {
  const v = Math.round(n || 0);
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US")}`;
}

function formatMoneyDetailed(n) {
  const sign = (n || 0) < 0 ? "-" : "";
  return `${sign}$${Math.abs(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}`;
}

const CATEGORY_COLORS = ["#0d9488", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

export default function ProfitLossReport({ financials }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await base44.functions.invoke("parseFinancialReport", { action: "load" });
      if (res.data?.report) setReport(res.data.report);
    } catch (e) {
      console.error("Failed to load financial report:", e);
    }
    setLoading(false);
  };

  const plData = useMemo(() => {
    if (!financials?.monthly_data) return null;

    const expenses = report?.data?.expenses || { categories: {}, monthly: {} };
    const stripeFeesHist = report?.data?.stripe_fees || {};
    const monthlyRevenue = financials.monthly_data;

    // Get all months sorted
    const allMonths = new Set([
      ...Object.keys(monthlyRevenue),
      ...Object.keys(expenses.monthly || {}),
      ...Object.keys(stripeFeesHist),
    ]);
    const sortedMonths = [...allMonths].sort();

    // Only show last 12 months for readability
    const displayMonths = sortedMonths.slice(-12);

    const rows = displayMonths.map(key => {
      const rev = monthlyRevenue[key] || {};
      const revenue = rev.revenue || 0;
      const refunds = rev.is_historical ? 0 : 0; // Historical data already nets refunds
      const expensesTotal = expenses.monthly?.[key] || 0;
      const stripeFee = stripeFeesHist[key] || 0;
      const netProfit = revenue - expensesTotal - stripeFee;

      return {
        key,
        month: monthLabel(key),
        revenue,
        expenses: expensesTotal,
        stripeFees: stripeFee,
        refunds,
        netProfit,
        margin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      };
    });

    // Category breakdown
    const categoryBreakdown = Object.entries(expenses.categories || {})
      .map(([cat, data]) => ({ category: cat, total: data.total_usd, monthly: data.monthly }))
      .sort((a, b) => b.total - a.total);

    // Totals
    const totals = rows.reduce((acc, r) => ({
      revenue: acc.revenue + r.revenue,
      expenses: acc.expenses + r.expenses,
      stripeFees: acc.stripeFees + r.stripeFees,
      netProfit: acc.netProfit + r.netProfit,
    }), { revenue: 0, expenses: 0, stripeFees: 0, netProfit: 0 });

    totals.margin = totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0;

    return { rows, categoryBreakdown, totals };
  }, [financials, report]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No financial data available. Upload a historical report in the Finances tab.</p>
      </div>
    );
  }

  const { rows, categoryBreakdown, totals } = plData;

  const cards = [
    { label: "Total Revenue", value: formatMoney(totals.revenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Operating Expenses", value: formatMoney(totals.expenses), icon: Receipt, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Stripe Fees", value: formatMoney(totals.stripeFees), icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
    {
      label: "Net Profit",
      value: formatMoney(totals.netProfit),
      icon: totals.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: totals.netProfit >= 0 ? "text-teal-600" : "text-red-500",
      bg: totals.netProfit >= 0 ? "bg-teal-50" : "bg-red-50",
      sub: `${totals.margin.toFixed(1)}% margin`,
    },
  ];

  const chartData = rows.map(r => ({
    month: r.month,
    Revenue: Math.round(r.revenue),
    Expenses: Math.round(r.expenses + r.stripeFees),
    Profit: Math.round(r.netProfit),
  }));

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {cards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xs text-slate-500 font-body">{s.label}</p>
              </div>
              <p className="font-body text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
              {s.sub && <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue vs Expenses vs Profit chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-body font-semibold text-slate-900 mb-3">Revenue, Expenses & Profit — Last {chartData.length} Months</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                cursor={{ fill: "rgba(13,148,136,0.05)" }}
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value) => formatMoneyDetailed(value)}
              />
              <Bar dataKey="Revenue" fill="#99f6e4" radius={[3, 3, 0, 0]} barSize={18} />
              <Bar dataKey="Expenses" fill="#fcd34d" radius={[3, 3, 0, 0]} barSize={18} />
              <Line type="monotone" dataKey="Profit" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3, fill: "#0d9488" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#99f6e4]" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#fcd34d]" /> Expenses</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" /> Net Profit</span>
          </div>
        </div>
      )}

      {/* Monthly P&L table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-body font-semibold text-slate-900">Monthly Profit & Loss</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-2.5 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Month</th>
                <th className="text-right px-4 py-2.5 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Revenue</th>
                <th className="text-right px-4 py-2.5 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Expenses</th>
                <th className="text-right px-4 py-2.5 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Stripe Fees</th>
                <th className="text-right px-4 py-2.5 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Net Profit</th>
                <th className="text-right px-4 py-2.5 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.key} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${idx === rows.length - 1 ? "font-semibold bg-teal-50/30" : ""}`}>
                  <td className="px-4 py-2.5 font-body text-slate-700">{r.month}</td>
                  <td className="px-4 py-2.5 text-right font-body text-emerald-600">{formatMoney(r.revenue)}</td>
                  <td className="px-4 py-2.5 text-right font-body text-amber-600">{formatMoney(r.expenses)}</td>
                  <td className="px-4 py-2.5 text-right font-body text-blue-600">{formatMoney(r.stripeFees)}</td>
                  <td className={`px-4 py-2.5 text-right font-body font-bold ${r.netProfit >= 0 ? "text-teal-700" : "text-red-500"}`}>
                    {formatMoney(r.netProfit)}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-body text-xs ${r.margin >= 0 ? "text-teal-600" : "text-red-400"}`}>
                    {r.margin.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 font-body font-bold text-slate-900">Total</td>
                <td className="px-4 py-3 text-right font-body font-bold text-emerald-700">{formatMoney(totals.revenue)}</td>
                <td className="px-4 py-3 text-right font-body font-bold text-amber-700">{formatMoney(totals.expenses)}</td>
                <td className="px-4 py-3 text-right font-body font-bold text-blue-700">{formatMoney(totals.stripeFees)}</td>
                <td className={`px-4 py-3 text-right font-body font-bold text-base ${totals.netProfit >= 0 ? "text-teal-700" : "text-red-600"}`}>
                  {formatMoney(totals.netProfit)}
                </td>
                <td className={`px-4 py-3 text-right font-body font-bold ${totals.margin >= 0 ? "text-teal-600" : "text-red-500"}`}>
                  {totals.margin.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Expense breakdown by category */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-body font-semibold text-slate-900 mb-3">Operating Expenses by Category</p>
          <div className="space-y-2.5">
            {categoryBreakdown.map(([cat, data], idx) => {
              const maxTotal = categoryBreakdown[0].total;
              const pct = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
              const shareOfTotal = totals.expenses > 0 ? (data.total / totals.expenses) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 font-body">{cat}</span>
                    <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                      {formatMoney(data.total)}
                      <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({shareOfTotal.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense line items detail */}
      {report?.data?.expenses?.line_items?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-body font-semibold text-slate-900">Expense Line Items</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{report.data.expenses.line_items.length} items · CAD converted to USD @ 0.727</p>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Tool / Item</th>
                  <th className="text-right px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase tracking-wide">Total (USD)</th>
                </tr>
              </thead>
              <tbody>
                {report.data.expenses.line_items
                  .sort((a, b) => b.total_usd - a.total_usd)
                  .map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2 text-xs text-slate-500 font-body">{item.category}</td>
                    <td className="px-4 py-2 text-xs text-slate-700 font-body">{item.tool}</td>
                    <td className="px-4 py-2 text-right font-body text-slate-900 font-medium">{formatMoneyDetailed(item.total_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}