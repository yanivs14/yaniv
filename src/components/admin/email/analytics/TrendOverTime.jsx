import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { computeMonthlyTrend } from "@/components/admin/email/analytics/helpers";

export default function TrendOverTime({ contacts, financials }) {
  const trendData = useMemo(() => computeMonthlyTrend(contacts, financials), [contacts, financials]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-body font-semibold text-slate-900 mb-4">Jul '24 → Today (MoM, DoD, YoY, WoW)</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MRR Chart */}
          <div>
            <p className="text-xs text-slate-500 font-body mb-2">MRR ($)</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} formatter={v => [`$${v.toLocaleString()}`, "MRR"]} />
                <Line type="monotone" dataKey="mrr" stroke="#006d63" strokeWidth={2.5} dot={{ r: 3, fill: "#006d63" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Total Active Members Chart */}
          <div>
            <p className="text-xs text-slate-500 font-body mb-2">Total Active Members</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 50", "dataMax + 50"]} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} formatter={v => [v.toLocaleString(), "Active"]} />
                <Line type="monotone" dataKey="activeMembers" stroke="#c79810" strokeWidth={2.5} dot={{ r: 3, fill: "#c79810" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-body font-bold text-slate-900 mb-2">Editing and breakdown timelines and dates:</p>
        <ul className="space-y-1.5 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Date From, to</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Monthly, yearly, daily, day of week</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Growth or decline YoY, MoM, WoW</span>
          </li>
        </ul>
      </div>
    </div>
  );
}