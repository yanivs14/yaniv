import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Line, ComposedChart } from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}`;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  return isNaN(d) ? null : d;
}

export default function TrendOverTime({ contacts, financials }) {
  const trendData = useMemo(() => {
    const monthlyMap = {};

    for (const [key, val] of Object.entries(financials.monthly_data || {})) {
      if (!monthlyMap[key]) monthlyMap[key] = { month: monthLabel(key), revenue: 0, newUsers: 0, churned: 0 };
      monthlyMap[key].revenue = Math.round(val.revenue || 0);
    }

    for (const c of contacts) {
      const d = normalizeDate(c.first_payment_date);
      if (!d) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: monthLabel(key), revenue: 0, newUsers: 0, churned: 0 };
      monthlyMap[key].newUsers += 1;
    }

    for (const c of contacts) {
      const d = normalizeDate(c.subscription_canceled);
      if (!d) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: monthLabel(key), revenue: 0, newUsers: 0, churned: 0 };
      monthlyMap[key].churned += 1;
    }

    return Object.entries(monthlyMap)
      .filter(([key]) => key >= "2024-07")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, val]) => val);
  }, [contacts, financials]);

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Revenue · New Users · Churned (Monthly)</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="newUsers" name="New Users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-x-auto">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Monthly Breakdown</p>
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-xs text-slate-400 uppercase border-b border-slate-200">
              <th className="text-left py-2">Month</th>
              <th className="text-right py-2">Revenue</th>
              <th className="text-right py-2">New Users</th>
              <th className="text-right py-2">Churned</th>
              <th className="text-right py-2">Net Growth</th>
            </tr>
          </thead>
          <tbody>
            {trendData.slice().reverse().map((d, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 text-slate-700">{d.month}</td>
                <td className="py-2 text-right text-emerald-600 font-semibold">${d.revenue.toLocaleString()}</td>
                <td className="py-2 text-right text-blue-600">{d.newUsers}</td>
                <td className="py-2 text-right text-red-500">{d.churned}</td>
                <td className={`py-2 text-right font-semibold ${d.newUsers - d.churned >= 0 ? "text-emerald-600" : "text-red-500"}`}>{d.newUsers - d.churned > 0 ? "+" : ""}{d.newUsers - d.churned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}