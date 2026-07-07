import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney, isToday, isThisMonth, computeFullTrend } from "@/components/admin/email/analytics/helpers";
import MovedMetrics from "./MovedMetrics";
import ActiveUsersPerPlan from "./ActiveUsersPerPlan";
import CohortTable from "./CohortTable";
import ExportButton from "./ExportButton";

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
  const last = data[data.length - 1] || {};
  const first = data[0] || {};
  const change = first[dataKey] !== undefined && last[dataKey] !== undefined ? last[dataKey] - first[dataKey] : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 font-body">{title}</p>
        {change !== 0 && (
          <span className={`text-[10px] font-bold ${change > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change > 0 ? "↑" : "↓"} {Math.abs(change).toLocaleString()}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
        <span>{first.month || "—"}</span>
        <span>{last.month || "—"}</span>
      </div>
    </motion.div>
  );
}

export default function ExecutiveOverview({ contacts, financials, stats }) {
  const skoolActive = stats.in_skool || 0;
  const stripeActive = useMemo(() => contacts.filter(c => c.stripe_customer_id && c.is_paying_customer && !c.is_churned).length, [contacts]);
  const totalActive = stats.paying_customers || 0;
  const innerCircle = useMemo(() => contacts.filter(c => c.is_inner_circle && c.is_paying_customer && !c.is_churned).length, [contacts]);
  const mrr = financials.mrr || 0;
  const arr = mrr * 12;
  const mtdNewUsers = useMemo(() => contacts.filter(c => isThisMonth(c.first_payment_date)).length, [contacts]);
  const mtdChurned = useMemo(() => contacts.filter(c => isThisMonth(c.subscription_canceled)).length, [contacts]);
  const newLeadsToday = useMemo(() => contacts.filter(c => isToday(c.created_date)).length, [contacts]);
  const leadConversion = contacts.length > 0 ? ((stats.paying_customers || 0) / contacts.length * 100).toFixed(0) : 0;

  const fullTrend = useMemo(() => computeFullTrend(contacts, financials), [contacts, financials]);
  const trend = fullTrend.slice(-13);
  const exportData = fullTrend.map(t => ({
    month: t.month,
    active_members: t.activeMembers,
    new_signups: t.newSignups,
    churned: t.cancellations,
    revenue: Math.round(t.revenue),
    mrr: Math.round(t.mrr),
    net_cashflow: Math.round(t.netCashFlow),
  }));

  return (
    <div className="space-y-4">
      {/* Export */}
      <div className="flex justify-end">
        <ExportButton data={exportData} filename="executive_overview" label="Export" />
      </div>

      {/* Deduplicated Active Members — leftmost */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Active Members (Deduplicated by Email)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Total Active (Dedup)" value={totalActive.toLocaleString()} status="green" footer="Stripe + Skool merged by email" delay={0} />
          <MetricCard label="Skool Active" value={skoolActive.toLocaleString()} footer="From Skool CSV upload" delay={0.05} />
          <MetricCard label="Stripe Active" value={stripeActive.toLocaleString()} footer="Active subscriptions + charges" delay={0.1} />
          <MetricCard label="Inner Circle" value={innerCircle} footer="Skool IC group + $350 Stripe" delay={0.15} />
        </div>
      </div>

      {/* Revenue: MRR vs Cashflow */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Revenue — MRR vs Cashflow</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="MRR" value={formatMoney(mrr)} status="gold" footer="Active subs: monthly + annual÷12" delay={0.2} />
          <MetricCard label="ARR (run-rate)" value={formatMoney(arr)} footer="MRR × 12 (forward-looking)" delay={0.25} />
          <MetricCard label="Cashflow This Month" value={formatMoney(financials.this_month_revenue)} footer={`${financials.this_month_transactions || 0} transactions · all revenue`} delay={0.3} />
          <MetricCard label="Total Cashflow" value={formatMoney(financials.total_revenue)} footer="All time (since Jul '24)" delay={0.35} />
        </div>
      </div>

      {/* Growth */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Growth</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="MTD New Users" value={mtdNewUsers} footer="First Stripe payment MTD" delay={0.4} />
          <MetricCard label="MTD Churned" value={mtdChurned} status="gold" footer="Stripe cancellations MTD" delay={0.45} />
          <MetricCard label="New Leads Today" value={newLeadsToday} footer={`${contacts.length} total contacts`} delay={0.5} />
          <MetricCard label="Lead → Purchase" value={`${leadConversion}%`} footer={`${stats.paying_customers || 0} of ${contacts.length}`} delay={0.55} />
        </div>
      </div>

      {/* Moved from Screen 2: Unit Economics */}
      <MovedMetrics contacts={contacts} financials={financials} stats={stats} />

      {/* Active Users per Plan */}
      <ActiveUsersPerPlan contacts={contacts} />

      {/* Trend Sparklines — full timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SparklineCard title="MRR Trend (Jul '24 → Today)" data={fullTrend} dataKey="mrr" color="#0d9488" delay={0.6} />
        <SparklineCard title="Active Members (Jul '24 → Today)" data={fullTrend} dataKey="activeMembers" color="#c79810" delay={0.65} />
      </div>

      {/* Cashflow MoM Trend */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 font-body mb-2">Total Cashflow Revenue — MoM Trend (Jul '24 → Today)</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={fullTrend} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <Line type="monotone" dataKey="revenue" stroke="#007a78" strokeWidth={2} dot={{ r: 2, fill: "#007a78" }} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px" }} labelStyle={{ color: "#1e293b", fontWeight: 600 }} itemStyle={{ color: "#475569" }} formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Cohorts */}
      <CohortTable contacts={contacts} financials={financials} />

      {/* Info Box — definitions */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-body font-bold text-slate-900 mb-2">Definitions & Methodology</p>
        <ul className="space-y-2 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Dedup method:</strong> Contacts merged by email (lowercased). Same person in Stripe + Skool = 1 record. This is the leftmost, primary number.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>All time:</strong> Since July 2024 — earliest data from historical Excel + Stripe.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>MRR:</strong> Sum of active monthly subs + (annual subs ÷ 12). Excludes one-time charges.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Cashflow:</strong> All revenue including one-time charges (Handstand Course $97, Inner Circle $350).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>MTD New Users:</strong> From Stripe first_payment_date in current calendar month (UTC).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>MTD Churned:</strong> From Stripe subscription_canceled in current calendar month (UTC). Deduped across platforms.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Revenue source of truth:</strong> Stripe (all payments go through it). Skool used for member status & IC identification only — no revenue double-counting.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}