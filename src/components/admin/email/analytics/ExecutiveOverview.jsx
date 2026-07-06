import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, Users, Activity, TrendingUp, Crown, RotateCcw, Calendar, Mail } from "lucide-react";

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  if (isNaN(d)) return false;
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export default function ExecutiveOverview({ contacts, financials, stats }) {
  const newLeadsToday = useMemo(() => contacts.filter(c => isToday(c.created_date)).length, [contacts]);
  const newCustomersToday = useMemo(() => contacts.filter(c => isToday(c.first_payment_date)).length, [contacts]);

  const cards = [
    { label: "Revenue This Month", value: formatMoney(financials.this_month_revenue), sub: `${financials.this_month_transactions || 0} transactions`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "MRR", value: formatMoney(financials.mrr), sub: "Monthly recurring", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Active Members", value: stats.paying_customers || 0, sub: "Paying customers", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New Leads Today", value: newLeadsToday, sub: `${contacts.length} total leads`, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "New Customers Today", value: newCustomersToday, sub: "From purchases", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "ARPU", value: formatMoney(financials.arpu), sub: "Avg revenue / customer", icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Churned", value: stats.churned || 0, sub: `${(financials.churn_rate || 0).toFixed(1)}% churn rate`, icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Revenue", value: formatMoney(financials.total_revenue), sub: "All time", icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-xs text-slate-500 font-body">{c.label}</p>
            </div>
            <p className="font-body text-2xl font-bold text-slate-900 leading-none">{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}