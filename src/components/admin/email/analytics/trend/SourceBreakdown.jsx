import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

const SOURCE_META = {
  stripe: { label: "Stripe (Direct)", color: "#0d9488" },
  skool: { label: "Skool Members", color: "#f59e0b" },
  quiz: { label: "Quiz Leads", color: "#6366f1" },
  inner_circle: { label: "Inner Circle", color: "#8b5cf6" },
  other: { label: "Other", color: "#94a3b8" },
};

export default function SourceBreakdown({ contacts }) {
  const data = useMemo(() => {
    const counts = {};
    const revenue = {};
    for (const c of contacts) {
      let source = c.source || "other";
      if (c.is_inner_circle) source = "inner_circle";
      else if (c.skool_member) source = "skool";
      else if (source === "stripe") source = "stripe";
      else if (source === "quiz") source = "quiz";
      else source = "other";
      counts[source] = (counts[source] || 0) + 1;
      revenue[source] = (revenue[source] || 0) + (c.total_paid || 0);
    }
    return Object.entries(counts).map(([key, count]) => ({
      key, label: SOURCE_META[key]?.label || key, color: SOURCE_META[key]?.color || "#94a3b8", count, revenue: revenue[key] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [contacts]);

  const pieData = data.map(d => ({ name: d.label, value: d.count, color: d.color }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-indigo-500 rounded-full" />
        <p className="text-sm font-body font-bold text-slate-900">Source Breakdown — Skool vs Stripe</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: "10px" }}>
              {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5">
          {data.map(d => (
            <div key={d.key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="font-body text-slate-600">{d.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{d.count}</span>
                <span className="text-slate-400 ml-2">{formatMoney(d.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">All revenue processes through Stripe. Skool/IC indicate community membership, not a separate payment source.</p>
    </div>
  );
}