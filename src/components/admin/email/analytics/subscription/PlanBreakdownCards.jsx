import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { SUB_PLAN_CATEGORIES } from "@/lib/trendUtils";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

function PlanCard({ catKey, meta, summary, sparkData, metric, delay }) {
  const active = summary.active || 0;
  const revenue = summary.revenue || 0;
  const newSignups = summary.newSignups || 0;
  const churned = summary.churned || 0;
  const arpu = active > 0 ? revenue / active : 0;
  const net = newSignups - churned;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ background: meta.color }} />
        <p className="text-sm font-body font-bold text-slate-900">{meta.label}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Active</p>
          <p className="font-body text-lg font-bold text-slate-900">{active}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Revenue</p>
          <p className="font-body text-lg font-bold text-slate-900">{formatMoney(revenue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">New</p>
          <p className="font-body text-sm font-bold text-emerald-600">{newSignups}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Churned</p>
          <p className="font-body text-sm font-bold text-red-500">{churned}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400">ARPU</span>
        <span className="font-bold text-teal-600">{formatMoney(arpu, 2)}</span>
      </div>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-slate-400">Net Growth</span>
        <span className={`font-bold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}>{net >= 0 ? "+" : ""}{net}</span>
      </div>
      {sparkData.length > 1 && (
        <ResponsiveContainer width="100%" height={36}>
          <LineChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <Line type="monotone" dataKey="v" stroke={meta.color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

function TotalCard({ summary, sparkData, delay }) {
  const arpu = summary.active > 0 ? summary.revenue / summary.active : 0;
  const net = summary.newSignups - summary.churned;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-teal-400" />
        <p className="text-sm font-body font-bold text-white">Total — All Plans</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Active</p>
          <p className="font-body text-lg font-bold text-white">{summary.active}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Revenue</p>
          <p className="font-body text-lg font-bold text-white">{formatMoney(summary.revenue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">New</p>
          <p className="font-body text-sm font-bold text-emerald-400">{summary.newSignups}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Churned</p>
          <p className="font-body text-sm font-bold text-red-400">{summary.churned}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400">ARPU</span>
        <span className="font-bold text-teal-400">{formatMoney(arpu, 2)}</span>
      </div>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-slate-400">Net Growth</span>
        <span className={`font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>{net >= 0 ? "+" : ""}{net}</span>
      </div>
      {sparkData.length > 1 && (
        <ResponsiveContainer width="100%" height={36}>
          <LineChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <Line type="monotone" dataKey="v" stroke="#2dd4bf" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

export default function PlanBreakdownCards({ planSummary, userTrend, revTrend, metric }) {
  const cats = useMemo(() =>
    Object.entries(SUB_PLAN_CATEGORIES).filter(([key]) => {
      const s = planSummary[key];
      return s && (s.active > 0 || s.revenue > 0);
    }),
  [planSummary]);

  const totalSummary = useMemo(() => {
    return Object.values(planSummary).reduce((acc, s) => ({
      active: acc.active + (s.active || 0),
      revenue: acc.revenue + (s.revenue || 0),
      newSignups: acc.newSignups + (s.newSignups || 0),
      churned: acc.churned + (s.churned || 0),
    }), { active: 0, revenue: 0, newSignups: 0, churned: 0 });
  }, [planSummary]);

  const getSparkData = (catKey) => {
    const data = metric === "revenue" ? revTrend : userTrend;
    const field = metric === "revenue" ? `${catKey}_revenue` : `${catKey}_active`;
    return data.map(d => ({ label: d.label, v: d[field] || 0 }));
  };

  const totalSpark = () => {
    const data = metric === "revenue" ? revTrend : userTrend;
    const field = metric === "revenue" ? "total_revenue" : "total_active";
    return data.map(d => ({ label: d.label, v: d[field] || 0 }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {cats.map(([key, meta], i) => (
        <PlanCard key={key} catKey={key} meta={meta} summary={planSummary[key] || {}}
          sparkData={getSparkData(key)} metric={metric} delay={i * 0.05} />
      ))}
      <TotalCard summary={totalSummary} sparkData={totalSpark()} delay={cats.length * 0.05} />
    </div>
  );
}