import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, isToday, isThisMonth, computeMonthlyTrend } from "@/components/admin/email/analytics/helpers";

function StatusDot({ status }) {
  if (!status) return null;
  const colors = { green: "bg-emerald-500", gold: "bg-amber-500" };
  const labels = { green: "GOOD", gold: "WATCH" };
  const textColors = { green: "text-emerald-600", gold: "text-amber-600" };
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

function SparklineCard({ title, data, dataKey, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-slate-500 font-body mb-2">{title}</p>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default function ExecutiveOverview({ contacts, financials, stats }) {
  const skoolActive = stats.in_skool || 0;
  const stripeActive = useMemo(() => contacts.filter(c => c.stripe_customer_id && c.is_paying_customer && !c.is_churned).length, [contacts]);
  const totalActive = stats.paying_customers || 0;
  const innerCircle = useMemo(() => contacts.filter(c => (c.purchase_plan || "").toLowerCase().includes("inner circle")).length, [contacts]);
  const mrr = financials.mrr || 0;
  const arr = mrr * 12;
  const mtdNewUsers = useMemo(() => contacts.filter(c => isThisMonth(c.first_payment_date)).length, [contacts]);
  const mtdChurned = useMemo(() => contacts.filter(c => isThisMonth(c.subscription_canceled)).length, [contacts]);
  const newLeadsToday = useMemo(() => contacts.filter(c => isToday(c.created_date)).length, [contacts]);

  const trend = useMemo(() => {
    const full = computeMonthlyTrend(contacts, financials);
    return full.slice(-13);
  }, [contacts, financials]);

  return (
    <div className="space-y-4">
      {/* Platform Active Members */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Platform Active Members</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Skool Active" value={skoolActive.toLocaleString()} delay={0} />
          <MetricCard label="Stripe Active" value={stripeActive.toLocaleString()} delay={0.05} />
          <MetricCard label="Total Active (Dedup)" value={totalActive.toLocaleString()} status="green" footer="Deduplicated across all platforms" delay={0.1} />
          <MetricCard label="Inner Circle" value={innerCircle} delay={0.15} />
        </div>
      </div>

      {/* Revenue & Growth */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Revenue & Growth</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="MRR" value={formatMoney(mrr)} status="gold" footer="Monthly recurring revenue" delay={0.2} />
          <MetricCard label="ARR (run-rate)" value={formatMoney(arr)} footer="MRR × 12" delay={0.25} />
          <MetricCard label="MTD New Users" value={mtdNewUsers} footer="Month-to-date" delay={0.3} />
          <MetricCard label="MTD Churned" value={mtdChurned} status="gold" footer="Month-to-date" delay={0.35} />
        </div>
      </div>

      {/* Additional Metrics */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Additional Metrics</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Revenue This Month" value={formatMoney(financials.this_month_revenue)} footer={`${financials.this_month_transactions || 0} transactions`} delay={0.4} />
          <MetricCard label="Total Revenue" value={formatMoney(financials.total_revenue)} footer="All time" delay={0.45} />
          <MetricCard label="ARPU" value={formatMoney(financials.arpu)} footer="Avg revenue / customer" delay={0.5} />
          <MetricCard label="New Leads Today" value={newLeadsToday} footer={`${contacts.length} total contacts`} delay={0.55} />
        </div>
      </div>

      {/* Trend Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SparklineCard title="MRR Trend (13 mo)" data={trend} dataKey="mrr" color="#0d9488" delay={0.6} />
        <SparklineCard title="Total Active Members (13 mo)" data={trend} dataKey="activeMembers" color="#c79810" delay={0.65} />
      </div>

      {/* Info Box */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <ul className="space-y-2 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Check every morning: The <strong className="text-slate-900">single source of truth</strong> for "are we growing."</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Metrics requiring immediate action = trigger an immediate leadership huddle, don't wait for the weekly sync.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Deduped Total Active is the number that matters for board/investor updates, not platform-by-platform counts.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}