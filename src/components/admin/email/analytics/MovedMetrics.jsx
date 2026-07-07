import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

export default function MovedMetrics({ contacts, financials, stats }) {
  const arpu = financials.arpu || 0;
  const churnRate = financials.churn_rate || 0;
  const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu;
  const netRevPerCustomer = stats.paying_customers > 0
    ? (financials.total_revenue - financials.total_refunded) / stats.paying_customers
    : 0;
  const refundRate = (financials.total_revenue + financials.total_refunded) > 0
    ? (financials.total_refunded / (financials.total_revenue + financials.total_refunded)) * 100
    : 0;

  const avgTenure = useMemo(() => {
    const paying = contacts.filter(c => c.first_payment_date);
    if (!paying.length) return 0;
    const now = new Date();
    const totalMonths = paying.reduce((sum, c) => {
      const start = new Date(c.first_payment_date);
      const end = c.subscription_canceled ? new Date(c.subscription_canceled) : now;
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return sum + Math.max(0, months);
    }, 0);
    return totalMonths / paying.length;
  }, [contacts]);

  const cards = [
    { label: "LTV", value: formatMoney(ltv), sub: "ARPU ÷ churn rate", color: "text-purple-600" },
    { label: "Churn Rate", value: `${churnRate.toFixed(1)}%`, sub: `${stats.churned || 0} churned users`, color: "text-red-500" },
    { label: "Net Rev / Customer", value: formatMoney(netRevPerCustomer), sub: "After refunds", color: "text-teal-600" },
    { label: "Avg Tenure", value: `${avgTenure.toFixed(1)} mo`, sub: "Months active (avg)", color: "text-blue-600" },
    { label: "Refund Rate", value: `${refundRate.toFixed(1)}%`, sub: `${formatMoney(financials.total_refunded)} refunded`, color: "text-amber-600" },
  ];

  return (
    <div>
      <p className="text-[11px] text-slate-400 uppercase tracking-wide font-body font-semibold mb-2">Unit Economics</p>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm"
          >
            <p className="text-xs text-slate-500 font-body mb-1">{c.label}</p>
            <p className={`font-body text-xl font-bold ${c.color} leading-none`}>{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}