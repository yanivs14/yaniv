import React, { useMemo } from "react";
import { motion } from "framer-motion";

function categorizePlan(plan) {
  const lower = (plan || "").toLowerCase();
  if (lower.includes("year") || lower.includes("annual")) return "annual";
  if (lower.includes("month") || lower.includes("promo") || lower.includes("special")) return "monthly";
  return "untagged";
}

const PLAN_COLORS = {
  monthly: "#0d9488",
  annual: "#f59e0b",
  untagged: "#94a3b8",
  inner_circle: "#6366f1",
};

export default function ActiveUsersPerPlan({ contacts }) {
  const { cats, planDetail } = useMemo(() => {
    const cats = { monthly: 0, annual: 0, untagged: 0, inner_circle: 0 };
    const planDetail = {};
    for (const c of contacts) {
      if (!c.is_paying_customer || c.is_churned) continue;
      if (c.is_inner_circle) cats.inner_circle++;
      const cat = categorizePlan(c.purchase_plan);
      cats[cat]++;
      const plan = c.purchase_plan || "Unknown";
      planDetail[plan] = (planDetail[plan] || 0) + 1;
    }
    return { cats, planDetail: Object.entries(planDetail).sort((a, b) => b[1] - a[1]) };
  }, [contacts]);

  const cards = [
    { label: "Monthly", count: cats.monthly, color: PLAN_COLORS.monthly },
    { label: "Annual", count: cats.annual, color: PLAN_COLORS.annual },
    { label: "Inner Circle", count: cats.inner_circle, color: PLAN_COLORS.inner_circle },
    { label: "Untagged", count: cats.untagged, color: PLAN_COLORS.untagged },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm font-body font-semibold text-slate-900 mb-3">Active Users per Plan</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map(c => (
          <div key={c.label} className="text-center">
            <p className="text-2xl font-bold font-body leading-none" style={{ color: c.color }}>{c.count}</p>
            <p className="text-[10px] text-slate-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {planDetail.map(([plan, count], idx) => {
          const maxCount = planDetail[0][1];
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={plan}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-600 font-body truncate pr-2">{plan}</span>
                <span className="text-xs font-bold text-slate-900 flex-shrink-0">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  className="h-full rounded-full bg-teal-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}