import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, isThisMonth, computeMonthlyTrend } from "@/components/admin/email/analytics/helpers";

function StatusDot({ status }) {
  if (!status) return null;
  const colors = { green: "bg-emerald-500", gold: "bg-amber-500", gray: "bg-slate-300" };
  const labels = { green: "GOOD", gold: "WATCH", gray: "N/A" };
  const textColors = { green: "text-emerald-600", gold: "text-amber-600", gray: "text-slate-400" };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      {labels[status] && <span className={`text-[10px] font-bold ${textColors[status]}`}>{labels[status]}</span>}
    </div>
  );
}

function MetricCard({ label, value, status, footer, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-slate-500 font-body mb-1">{label}</p>
      <p className="font-body text-2xl font-bold text-slate-900 leading-none mb-1.5">{value}</p>
      {status && <StatusDot status={status} />}
      {footer && <p className="text-[11px] text-slate-400 mt-1">{footer}</p>}
    </motion.div>
  );
}

export default function UnitEconomics({ contacts, financials, stats }) {
  const [adSpend, setAdSpend] = useState("");

  const mtdNewUsers = useMemo(() => contacts.filter(c => isThisMonth(c.first_payment_date)).length, [contacts]);
  const arpu = financials.arpu || 0;
  const churnRate = financials.churn_rate || 0;

  const cac = useMemo(() => {
    const spend = parseFloat(adSpend) || 0;
    if (spend > 0 && mtdNewUsers > 0) return spend / mtdNewUsers;
    return null;
  }, [adSpend, mtdNewUsers]);

  const ltv = useMemo(() => {
    if (churnRate > 0) return arpu / (churnRate / 100);
    return arpu || 0;
  }, [arpu, churnRate]);

  const ltvCacRatio = cac && cac > 0 ? ltv / cac : null;
  const cacPayback = cac && arpu > 0 ? cac / arpu : null;

  const avgTotalPaid = useMemo(() => {
    const paying = contacts.filter(c => c.total_paid > 0);
    if (!paying.length) return 0;
    return paying.reduce((sum, c) => sum + c.total_paid, 0) / paying.length;
  }, [contacts]);

  const refundRate = useMemo(() => {
    const total = financials.total_revenue + financials.total_refunded;
    return total > 0 ? (financials.total_refunded / total) * 100 : 0;
  }, [financials]);

  const netRevPerCustomer = stats.paying_customers > 0 ? (financials.total_revenue - financials.total_refunded) / stats.paying_customers : 0;

  const trend = useMemo(() => computeMonthlyTrend(contacts, financials).slice(-13), [contacts, financials]);

  const cacStatus = cac === null ? "gray" : cac <= 30 ? "green" : "gold";
  const ratioStatus = ltvCacRatio === null ? "gray" : ltvCacRatio >= 3 ? "green" : "gold";
  const paybackStatus = cacPayback === null ? "gray" : cacPayback <= 6 ? "green" : "gold";
  const churnStatus = churnRate <= 9.2 ? "green" : "gold";
  const arpuStatus = arpu >= 14 ? "green" : "gold";

  return (
    <div className="space-y-4">
      {/* Ad Spend Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <label className="block text-xs text-slate-500 font-body mb-2">Monthly Ad Spend (for CAC calculation)</label>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">$</span>
          <input
            type="number"
            value={adSpend}
            onChange={e => setAdSpend(e.target.value)}
            placeholder="Enter total monthly ad spend"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-body text-slate-900 focus:outline-none focus:border-teal-500"
          />
          <span className="text-xs text-slate-400">{mtdNewUsers} new users MTD</span>
        </div>
      </div>

      {/* Core Metrics (3x2) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Blended CAC" value={cac !== null ? formatMoney(cac, 2) : "—"} status={cacStatus} footer="vs $30 target" delay={0} />
        <MetricCard label="Blended LTV" value={formatMoney(ltv, 0)} delay={0.05} />
        <MetricCard label="LTV : CAC Ratio" value={ltvCacRatio !== null ? `${ltvCacRatio.toFixed(1)}x` : "—"} status={ratioStatus} footer="above 3.0x min" delay={0.1} />
        <MetricCard label="CAC Payback" value={cacPayback !== null ? `${cacPayback.toFixed(1)} mo` : "—"} status={paybackStatus} footer="under 6mo target" delay={0.15} />
        <MetricCard label="Monthly Churn" value={`${churnRate.toFixed(1)}%`} status={churnStatus} footer="vs 9.2% industry" delay={0.2} />
        <MetricCard label="Blended ARPU" value={formatMoney(arpu, 2)} status={arpuStatus} footer="above $14 median" delay={0.25} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Avg Total Paid" value={formatMoney(avgTotalPaid, 2)} footer="Across all paying customers" delay={0.3} />
        <MetricCard label="Net Rev / Customer" value={formatMoney(netRevPerCustomer, 2)} footer="After refunds" delay={0.35} />
        <MetricCard label="Refund Rate" value={`${refundRate.toFixed(1)}%`} footer={`${formatMoney(financials.total_refunded)} refunded`} delay={0.4} />
      </div>

      {/* Trend Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.45 }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-body mb-2">MRR Trend (13 mo)</p>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={trend}>
              <Line type="monotone" dataKey="mrr" stroke="#0d9488" strokeWidth={2} dot={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-body mb-2">Total Active Members (13 mo)</p>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={trend}>
              <Line type="monotone" dataKey="activeMembers" stroke="#c79810" strokeWidth={2} dot={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Info Sidebar */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-body font-bold text-slate-900 mb-3">WHAT TO DO HERE</p>
        <ul className="space-y-2 text-sm text-slate-600 font-body mb-4">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Churn is the #1 lever: cutting churn from 9.9% → 7% roughly doubles LTV with zero new spend.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Cross-check monthly against Benchmarks tab — targets shift as the market moves.</span>
          </li>
        </ul>
        <p className="text-sm font-body font-bold text-slate-900 mb-2">Paid Infrastructure:</p>
        <ul className="space-y-2 text-sm text-slate-600 font-body mb-3">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>LTV:CAC below 3x = acquisition spend is destroying value — pause paid channels immediately.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>CAC payback under 6 months means you can safely invest — on weekly syncs, use this to greenlight ad budget increases.</span>
          </li>
        </ul>
        <p className="text-[11px] text-slate-400 italic">Refreshed: Weekly, Sunday</p>
      </div>
    </div>
  );
}