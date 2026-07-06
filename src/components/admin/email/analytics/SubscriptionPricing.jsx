import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { categorizePlan, formatMoney } from "@/components/admin/email/analytics/helpers";

const CATEGORY_META = {
  monthly: { label: "Monthly", color: "#006d6d" },
  annual: { label: "Annual", color: "#c69c33" },
  untagged: { label: "Untagged", color: "#aab8c2" },
};

const PRICING_TIERS = [
  { tier: "Monthly", monthly: "$35", annualMoEq: "$35" },
  { tier: "Promo", monthly: "$25", annualMoEq: "$25" },
  { tier: "Annual", monthly: "—", annualMoEq: "$20.83" },
  { tier: "Handstand Course", monthly: "—", annualMoEq: "$97 (one-time)" },
  { tier: "Inner Circle", monthly: "—", annualMoEq: "$350 (one-time)" },
];

export default function SubscriptionPricing({ contacts, financials }) {
  const breakdown = useMemo(() => {
    const cats = { monthly: { users: 0, revenue: 0 }, annual: { users: 0, revenue: 0 }, untagged: { users: 0, revenue: 0 } };
    for (const c of contacts) {
      if (!c.is_paying_customer) continue;
      const cat = categorizePlan(c.purchase_plan);
      cats[cat].users += 1;
      cats[cat].revenue += c.total_paid || 0;
    }
    return cats;
  }, [contacts]);

  const totalUsers = breakdown.monthly.users + breakdown.annual.users + breakdown.untagged.users;

  const pieData = useMemo(() => [
    { name: "Monthly", value: breakdown.monthly.users, color: CATEGORY_META.monthly.color },
    { name: "Annual", value: breakdown.annual.users, color: CATEGORY_META.annual.color },
    { name: "Untagged", value: breakdown.untagged.users, color: CATEGORY_META.untagged.color },
  ].filter(d => d.value > 0), [breakdown]);

  const planBreakdown = useMemo(() => {
    return Object.entries(financials.plan_breakdown || {})
      .sort((a, b) => b[1] - a[1])
      .map(([plan, count]) => ({ plan, count, category: categorizePlan(plan) }));
  }, [financials]);

  const totalRevenue = breakdown.monthly.revenue + breakdown.annual.revenue + breakdown.untagged.revenue;
  const monthlyPct = totalUsers > 0 ? (breakdown.monthly.users / totalUsers) * 100 : 0;
  const annualPct = totalUsers > 0 ? (breakdown.annual.users / totalUsers) * 100 : 0;
  const untaggedPct = totalUsers > 0 ? (breakdown.untagged.users / totalUsers) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: Donut Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-body font-bold text-slate-900 mb-1">Billing Mix</p>
        <p className="text-xs text-slate-400 mb-4">% of active users</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: "11px", fontWeight: "bold" }}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-slate-600 font-body">{d.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          {Object.entries(breakdown).map(([key, val]) => {
            const meta = CATEGORY_META[key];
            const pct = totalUsers > 0 ? (val.users / totalUsers) * 100 : 0;
            return (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-body">{meta.label}</span>
                <span className="font-bold text-slate-900">{val.users} ({pct.toFixed(0)}%)</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-body">ARPU</span>
            <span className="font-bold text-teal-600">{formatMoney(financials.arpu, 2)}</span>
          </div>
        </div>
      </div>

      {/* Middle: Pricing Tables */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-4 py-2.5">
            <p className="text-sm font-body font-bold text-white">Current Plans</p>
          </div>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400 uppercase">
                <th className="text-left py-2 px-3">Tier</th>
                <th className="text-right py-2 px-3">Monthly</th>
                <th className="text-right py-2 px-3">Annual (mo-eq)</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TIERS.map((row) => (
                <tr key={row.tier} className="border-b border-slate-100">
                  <td className="py-2 px-3 text-slate-700">{row.tier}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{row.monthly}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{row.annualMoEq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-4 py-2.5">
            <p className="text-sm font-body font-bold text-white">Revenue by Plan Type</p>
          </div>
          <div className="p-3 space-y-2">
            {Object.entries(breakdown).map(([key, val]) => {
              const meta = CATEGORY_META[key];
              const pct = totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-body">{meta.label}</span>
                    <span className="font-bold text-slate-900">{formatMoney(val.revenue)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: What To Do Here */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-3">What to do here</p>
        <ul className="space-y-2.5 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Untagged % rising month over month = a data-hygiene problem, not a pricing one — flag it.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Annual mix % (industry norm) = room to push annual harder at checkout and in win-back flows.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Every price change should show up here within one billing cycle — use it to validate pricing tests.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Legacy/grandfathered cohorts should shrink to zero as migration completes — track that decline here.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Breakdown over time and trends per monthly, annual and per pricing point.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>ARPU, and % of monthly vs annual.</span>
          </li>
        </ul>
      </div>

      {/* Full width: Customers by Plan detail */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-body font-bold text-slate-900 mb-3">Customers by Plan (Detailed Breakdown)</p>
        <div className="space-y-2">
          {planBreakdown.map(({ plan, count, category }, idx) => {
            const maxCount = planBreakdown[0]?.count || 1;
            const pct = (count / maxCount) * 100;
            const meta = CATEGORY_META[category];
            return (
              <div key={plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-body truncate pr-2">{plan}</span>
                  <span className="text-sm font-bold text-slate-900 flex-shrink-0">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="h-full rounded-full" style={{ backgroundColor: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}