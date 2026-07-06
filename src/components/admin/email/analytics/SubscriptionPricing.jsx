import React, { useMemo } from "react";
import { motion } from "framer-motion";

function categorizePlan(planStr) {
  const lower = (planStr || "").toLowerCase();
  if (lower.includes("year") || lower.includes("annual")) return "annual";
  if (lower.includes("month") || lower.includes("promo") || lower.includes("special")) return "monthly";
  return "untagged";
}

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const CATEGORY_META = {
  monthly: { label: "Monthly", color: "#0d9488" },
  annual: { label: "Annual", color: "#f59e0b" },
  untagged: { label: "Untagged", color: "#94a3b8" },
};

export default function SubscriptionPricing({ contacts, financials }) {
  const breakdown = useMemo(() => {
    const cats = { monthly: { users: 0, revenue: 0 }, annual: { users: 0, revenue: 0 }, untagged: { users: 0, revenue: 0 } };
    for (const c of contacts) {
      if (!c.is_paying_customer) continue;
      const cat = categorizePlan(c.purchase_plan);
      cats[cat].users += 1;
      cats[cat].revenue += c.total_paid || 0;
    }
    return cats;
  }, [contacts]);

  const planBreakdown = useMemo(() => {
    return Object.entries(financials.plan_breakdown || {})
      .sort((a, b) => b[1] - a[1])
      .map(([plan, count]) => ({ plan, count, category: categorizePlan(plan) }));
  }, [financials]);

  const totalUsers = breakdown.monthly.users + breakdown.annual.users + breakdown.untagged.users;
  const totalRevenue = breakdown.monthly.revenue + breakdown.annual.revenue + breakdown.untagged.revenue;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {Object.entries(breakdown).map(([key, val]) => {
          const meta = CATEGORY_META[key];
          const userPct = totalUsers > 0 ? (val.users / totalUsers) * 100 : 0;
          const revPct = totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                <p className="text-sm font-body font-bold text-slate-900">{meta.label}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Users</span>
                    <span className="font-bold text-slate-900">{val.users}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${userPct}%`, backgroundColor: meta.color }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Revenue</span>
                    <span className="font-bold text-slate-900">{formatMoney(val.revenue)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${revPct}%`, backgroundColor: meta.color }} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Customers by Plan</p>
        <div className="space-y-2">
          {planBreakdown.map(({ plan, count, category }, idx) => {
            const maxCount = planBreakdown[0]?.count || 1;
            const pct = (count / maxCount) * 100;
            const meta = CATEGORY_META[category];
            return (
              <div key={plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 font-body truncate pr-2">{plan}</span>
                  <span className="text-sm font-bold text-slate-900 flex-shrink-0">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="h-full rounded-full" style={{ backgroundColor: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}