import React, { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, ComposedChart } from "recharts";
import { computeFullTrend } from "@/components/admin/email/analytics/helpers";

const PLAN_COLORS = { monthly: "#0d9488", annual: "#f0ad4e", untagged: "#6f42c1" };

export default function TrendOverTime({ contacts, financials }) {
  const trendData = useMemo(() => computeFullTrend(contacts, financials), [contacts, financials]);
  const last13 = useMemo(() => trendData.slice(-13), [trendData]);

  const planPieData = useMemo(() => {
    const latest = last13[last13.length - 1] || {};
    return [
      { name: "Monthly", value: latest.mrrMonthly || 0, color: PLAN_COLORS.monthly },
      { name: "Annual", value: latest.mrrAnnual || 0, color: PLAN_COLORS.annual },
      { name: "Untagged", value: latest.mrrUntagged || 0, color: PLAN_COLORS.untagged },
    ].filter(d => d.value > 0);
  }, [last13]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-body font-semibold text-slate-900">Jul '24 → Today (MoM, DoD, YoY, WoW)</p>
        <p className="text-xs text-slate-400 mt-1">Monthly breakdown — {last13.length} data points</p>
      </div>

      {/* Left Column: Cash Flow Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-teal-800 rounded-full" />
          <p className="text-sm font-body font-bold text-slate-900">Cash Flow Overview</p>
          <span className="text-xs text-slate-400 ml-auto">Illustrative time-line</span>
        </div>

        {/* Graph 1: Net Cash Flow */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 font-body mb-2">Total Net Cash Flow</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last13} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} formatter={v => [`$${v.toLocaleString()}`, "Net Cash Flow"]} />
              <Line type="monotone" dataKey="netCashFlow" stroke="#007a78" strokeWidth={2.5} dot={{ r: 3, fill: "#007a78" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 2: Revenue vs Refunds (stacked bar) */}
        <div>
          <p className="text-xs text-slate-500 font-body mb-2">Revenue vs Refunds</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last13} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} formatter={v => `$${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#337ab7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="refunds" name="Refunds" fill="#d9534f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Column: MRR & Subscription Metrics */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-teal-800 rounded-full" />
          <p className="text-sm font-body font-bold text-slate-900">MRR & Subscription Metrics</p>
        </div>

        {/* Graph 3: MRR Line */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 font-body mb-2">MRR ($)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last13} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} formatter={v => [`$${v.toLocaleString()}`, "MRR"]} />
              <Line type="monotone" dataKey="mrr" stroke="#007a78" strokeWidth={2.5} dot={{ r: 3, fill: "#007a78" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 4: MRR Breakdown by Subscription Type (stacked bar) */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 font-body mb-2">MRR Breakdown by Subscription Type</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last13} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} formatter={v => `$${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="mrrMonthly" name="Monthly" stackId="a" fill={PLAN_COLORS.monthly} />
              <Bar dataKey="mrrAnnual" name="Annual" stackId="a" fill={PLAN_COLORS.annual} />
              <Bar dataKey="mrrUntagged" name="Untagged" stackId="a" fill={PLAN_COLORS.untagged} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 5: Active Subscriptions — Pie + Bar */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 font-body mb-2">Active Subscriptions by Duration</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={planPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: "10px" }}>
                  {planPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} formatter={v => `$${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last13} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} />
                <Bar dataKey="activeMembers" name="Active Members" fill="#007a78" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 6: Customer Churn & Growth (dual axis) */}
        <div>
          <p className="text-xs text-slate-500 font-body mb-2">Customer Churn & Growth Rate</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={last13} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "New Signups", angle: -90, position: "insideLeft", style: { fontSize: "10px", fill: "#94a3b8" } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} label={{ value: "Cancellations", angle: 90, position: "insideRight", style: { fontSize: "10px", fill: "#94a3b8" } }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar yAxisId="left" dataKey="newSignups" name="New Signups" fill="#5cb85c" radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cancellationRate" name="Cancellation Rate" stroke="#d9534f" strokeWidth={2.5} dot={{ r: 3, fill: "#d9534f" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-body font-bold text-slate-900 mb-2">Editing and breakdown timelines and dates:</p>
        <ul className="space-y-1.5 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">•</span><span>Date From, to</span></li>
          <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">•</span><span>Monthly, yearly, daily, day of week</span></li>
          <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">•</span><span>Growth or decline YoY, MoM, WoW</span></li>
        </ul>
      </div>
    </div>
  );
}