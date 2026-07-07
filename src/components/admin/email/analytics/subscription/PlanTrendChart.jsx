import React, { useMemo } from "react";
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SUB_PLAN_CATEGORIES } from "@/lib/trendUtils";

export default function PlanTrendChart({ userTrend, revTrend, chartType, metric, compUserTrend, compRevTrend }) {
  const data = metric === "revenue" ? revTrend : userTrend;

  const cats = useMemo(() => {
    const field = metric === "revenue" ? "revenue" : "active";
    return Object.entries(SUB_PLAN_CATEGORIES).filter(([key]) =>
      data.some(d => (d[`${key}_${field}`] || 0) > 0)
    );
  }, [data, metric]);

  const dataKeyFn = metric === "revenue" ? (cat => `${cat}_revenue`) : (cat => `${cat}_active`);

  const chartData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      comp_total: compUserTrend
        ? (metric === "revenue" ? (compRevTrend[i]?.total_revenue ?? null) : (compUserTrend[i]?.total_active ?? null))
        : null,
    }));
  }, [data, metric, compUserTrend, compRevTrend]);

  const formatValue = metric === "revenue"
    ? (v) => v != null ? `$${Number(v).toLocaleString()}` : "—"
    : (v) => v ?? "—";
  const formatAxis = metric === "revenue"
    ? (v) => `$${(v / 1000).toFixed(1)}k`
    : (v) => v;

  const renderSeries = () => {
    if (chartType === "line") {
      return cats.map(([key, meta]) => (
        <Line key={key} type="monotone" dataKey={dataKeyFn(key)} name={meta.short}
          stroke={meta.color} strokeWidth={2} dot={{ r: 2, fill: meta.color }} />
      ));
    }
    if (chartType === "area") {
      return cats.map(([key, meta]) => (
        <Area key={key} type="monotone" dataKey={dataKeyFn(key)} name={meta.short}
          stroke={meta.color} fill={meta.color} fillOpacity={0.3} stackId="1" />
      ));
    }
    if (chartType === "stacked") {
      return cats.map(([key, meta]) => (
        <Bar key={key} dataKey={dataKeyFn(key)} name={meta.short}
          fill={meta.color} stackId="1" radius={[2, 2, 0, 0]} />
      ));
    }
    return cats.map(([key, meta]) => (
      <Bar key={key} dataKey={dataKeyFn(key)} name={meta.short}
        fill={meta.color} radius={[3, 3, 0, 0]} />
    ));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-teal-600 rounded-full" />
        <p className="text-sm font-body font-bold text-slate-900">
          {metric === "revenue" ? "Revenue" : "Active Users"} per Plan — Over Time
        </p>
        <span className="text-[10px] text-slate-400 ml-auto">{chartData.length} periods · {chartType}</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} formatter={formatValue} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {renderSeries()}
          {compUserTrend && (
            <Line type="monotone" dataKey="comp_total" name="Prev Period Total"
              stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}