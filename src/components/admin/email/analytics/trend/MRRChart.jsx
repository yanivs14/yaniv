import React from "react";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MRRChart({ data, compData }) {
  const chartData = data.map((d, i) => ({ ...d, compMrr: compData?.[i]?.mrr || null }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-teal-600 rounded-full" />
        <p className="text-sm font-body font-bold text-slate-900">MRR Trend</p>
        <span className="text-[10px] text-slate-400 ml-auto">{data.length} periods</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} formatter={v => v != null ? `$${v.toLocaleString()}` : "—"} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Area type="monotone" dataKey="mrr" name="MRR" stroke="#0d9488" strokeWidth={2.5} fill="url(#mrrGrad)" />
          {compData && <Line type="monotone" dataKey="compMrr" name="Prev Period" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}