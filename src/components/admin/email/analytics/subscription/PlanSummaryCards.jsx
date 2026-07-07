import React from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

function Card({ label, value, sub, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
      <p className="text-xs text-slate-500 font-body mb-1">{label}</p>
      <p className="font-body text-xl font-bold text-slate-900 leading-none mb-1.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      {color && <div className="w-8 h-1 rounded-full mt-2" style={{ background: color }} />}
    </motion.div>
  );
}

export default function PlanSummaryCards({ planSummary, totalRevenue, totalActive }) {
  const monthlyActive = planSummary.monthly?.active || 0;
  const annualActive = planSummary.annual?.active || 0;
  const totalPaying = Object.values(planSummary).reduce((s, p) => s + (p.active || 0), 0);
  const monthlyMix = totalPaying > 0 ? (monthlyActive / totalPaying) * 100 : 0;
  const annualMix = totalPaying > 0 ? (annualActive / totalPaying) * 100 : 0;
  const arpu = totalActive > 0 ? totalRevenue / totalActive : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <Card label="Total Active Users" value={totalPaying.toLocaleString()} sub="All plan types combined" delay={0} />
      <Card label="Revenue (Period)" value={formatMoney(totalRevenue)} sub="Selected date range" delay={0.05} />
      <Card label="ARPU (Period)" value={formatMoney(arpu, 2)} sub="Revenue ÷ active users" delay={0.1} />
      <Card label="Monthly Mix" value={`${monthlyMix.toFixed(0)}%`} sub={`${monthlyActive} active users`} color="#0d9488" delay={0.15} />
      <Card label="Annual / Yearly Mix" value={`${annualMix.toFixed(0)}%`} sub={`${annualActive} active users`} color="#f59e0b" delay={0.2} />
    </div>
  );
}