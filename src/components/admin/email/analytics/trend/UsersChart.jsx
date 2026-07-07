import React from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function UsersChart({ data, compData }) {
  const chartData = data.map((d, i) => ({ ...d, compActive: compData?.[i]?.active || null }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-amber-500 rounded-full" />
        <p className="text-sm font-body font-bold text-slate-900">Users — Active / New / Churned</p>
        <span className="text-[10px] text-slate-400 ml-auto">{data.length} periods</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="new" name="New Signups" fill="#5cb85c" radius={[3, 3, 0, 0]} />
          <Bar dataKey="churned" name="Churned" fill="#d9534f" radius={[3, 3, 0, 0]} />
          <Line type="monotone" dataKey="active" name="Active Users" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b" }} />
          {compData && <Line type="monotone" dataKey="compActive" name="Prev Period Active" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}