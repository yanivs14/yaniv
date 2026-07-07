import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/components/admin/email/analytics/helpers";
import { pctChange } from "@/lib/trendUtils";

function KpiCard({ label, value, sub, compValue, delay }) {
  const change = compValue != null ? pctChange(parseFloat(String(value).replace(/[^0-9.-]/g, "")), compValue) : null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
      <p className="text-xs text-slate-500 font-body mb-1">{label}</p>
      <p className="font-body text-xl font-bold text-slate-900 leading-none mb-1.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      {change != null && (
        <span className={`text-[10px] font-bold ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% vs prev
        </span>
      )}
    </motion.div>
  );
}

export default function TrendSummary({ revenueData, userData, mrrData, compData }) {
  const totals = useMemo(() => {
    const rev = revenueData.reduce((s, r) => ({ gross: s.gross + r.gross, net: s.net + r.net, refunds: s.refunds + r.refunds, txns: s.txns + r.transactions }), { gross: 0, net: 0, refunds: 0, txns: 0 });
    const lastUsers = userData[userData.length - 1] || {};
    const avgMrr = mrrData.length > 0 ? mrrData.reduce((s, m) => s + m.mrr, 0) / mrrData.length : 0;
    const totalNew = userData.reduce((s, u) => s + u.new, 0);
    const totalChurned = userData.reduce((s, u) => s + u.churned, 0);
    return { ...rev, active: lastUsers.active || 0, avgMrr, totalNew, totalChurned };
  }, [revenueData, userData, mrrData]);

  const compTotals = useMemo(() => {
    if (!compData) return null;
    const rev = compData.revenue.reduce((s, r) => ({ net: s.net + r.net, txns: s.txns + r.transactions }), { net: 0, txns: 0 });
    const lastUsers = compData.users[compData.users.length - 1] || {};
    const avgMrr = compData.mrr.length > 0 ? compData.mrr.reduce((s, m) => s + m.mrr, 0) / compData.mrr.length : 0;
    return { net: rev.net, active: lastUsers.active || 0, avgMrr, totalNew: compData.users.reduce((s, u) => s + u.new, 0) };
  }, [compData]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard label="Net Revenue" value={formatMoney(totals.net)} sub={`${totals.txns} transactions`} compValue={compTotals?.net} delay={0} />
      <KpiCard label="Gross Revenue" value={formatMoney(totals.gross)} sub={`${formatMoney(totals.refunds)} refunded`} delay={0.05} />
      <KpiCard label="Active Users" value={totals.active} sub={`${totals.totalNew} new · ${totals.totalChurned} churned`} compValue={compTotals?.active} delay={0.1} />
      <KpiCard label="Avg MRR" value={formatMoney(totals.avgMrr)} compValue={compTotals?.avgMrr} delay={0.15} />
      <KpiCard label="Net New Users" value={totals.totalNew - totals.totalChurned} sub={`${totals.totalNew} gained − ${totals.totalChurned} lost`} delay={0.2} />
    </div>
  );
}