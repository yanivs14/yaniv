import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Percent, Crown, RotateCcw, TrendingUp, AlertCircle, DollarSign } from "lucide-react";

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function UnitEconomics({ contacts, financials, stats }) {
  const ltv = useMemo(() => {
    const churnRate = financials.churn_rate || 0;
    if (churnRate > 0) return financials.arpu / (churnRate / 100);
    return financials.arpu || 0;
  }, [financials]);

  const avgTotalPaid = useMemo(() => {
    const paying = contacts.filter(c => c.total_paid > 0);
    if (!paying.length) return 0;
    return paying.reduce((sum, c) => sum + c.total_paid, 0) / paying.length;
  }, [contacts]);

  const refundRate = useMemo(() => {
    const total = financials.total_revenue + financials.total_refunded;
    if (!total) return 0;
    return (financials.total_refunded / total) * 100;
  }, [financials]);

  const netRevenuePerCustomer = useMemo(() => {
    if (!stats.paying_customers) return 0;
    return (financials.total_revenue - financials.total_refunded) / stats.paying_customers;
  }, [financials, stats]);

  const cards = [
    { label: "LTV (Lifetime Value)", value: formatMoney(ltv), sub: "ARPU ÷ churn rate", icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "ARPU", value: formatMoney(financials.arpu), sub: "Avg revenue per customer", icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Avg Total Paid", value: formatMoney(avgTotalPaid), sub: "Across all paying customers", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Net Rev / Customer", value: formatMoney(netRevenuePerCustomer), sub: "After refunds", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Churn Rate", value: `${(financials.churn_rate || 0).toFixed(1)}%`, sub: `${stats.churned || 0} churned customers`, icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
    { label: "Refund Rate", value: `${refundRate.toFixed(1)}%`, sub: `${formatMoney(financials.total_refunded)} refunded`, icon: Percent, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-body font-semibold text-slate-900 mb-1">CAC (Customer Acquisition Cost)</p>
          <p className="text-xs text-slate-600">CAC requires ad spend data from Google Ads, Facebook Ads, or other marketing platforms. Connect your ad accounts to calculate CAC = Total Ad Spend ÷ New Customers Acquired.</p>
        </div>
      </div>
    </div>
  );
}