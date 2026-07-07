import React, { useMemo } from "react";
import { SUB_PLAN_CATEGORIES, categorizeSubscriptionPlan, getPlanPrice, isAnnualBilling } from "@/lib/trendUtils";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

export default function PlanDetailTable({ contacts, dateFrom, dateTo }) {
  const data = useMemo(() => {
    const start = new Date(dateFrom + "T00:00:00");
    const end = new Date(dateTo + "T23:59:59");
    const planStats = {};

    for (const c of contacts) {
      const plan = c.purchase_plan || "Unknown";
      const cat = categorizeSubscriptionPlan(plan);
      const price = getPlanPrice(plan);
      const annual = isAnnualBilling(plan);
      const join = c.first_payment_date ? new Date(c.first_payment_date) : null;
      const churn = c.subscription_canceled ? new Date(c.subscription_canceled) : null;

      if (!planStats[plan]) {
        planStats[plan] = { count: 0, totalPaid: 0, price, annual, cat, active: 0, newInPeriod: 0 };
      }
      planStats[plan].totalPaid += c.total_paid || 0;
      if (join && join <= end && (!churn || churn > end)) planStats[plan].active++;
      if (join && join >= start && join <= end) planStats[plan].newInPeriod++;
    }

    return Object.entries(planStats)
      .map(([plan, s]) => ({
        plan,
        catLabel: SUB_PLAN_CATEGORIES[s.cat]?.label || s.cat,
        catColor: SUB_PLAN_CATEGORIES[s.cat]?.color || "#94a3b8",
        count: s.count,
        active: s.active,
        newInPeriod: s.newInPeriod,
        price: s.price,
        annual: s.annual,
        totalPaid: s.totalPaid,
        arpu: s.active > 0 ? s.totalPaid / s.active : 0,
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid);
  }, [contacts, dateFrom, dateTo]);

  const totals = data.reduce((acc, d) => ({
    active: acc.active + d.active,
    totalPaid: acc.totalPaid + d.totalPaid,
    newInPeriod: acc.newInPeriod + d.newInPeriod,
  }), { active: 0, totalPaid: 0, newInPeriod: 0 });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-body font-semibold text-slate-900">Detailed Plan Breakdown</p>
          <p className="text-[11px] text-slate-400">Every individual plan — active users, revenue, pricing & signups in selected period</p>
        </div>
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-100">
              {["Plan", "Category", "Users", "Active", "New (Period)", "Price", "Billing", "Total Paid", "ARPU"].map((h, i) => (
                <th key={h} className={`px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase ${i <= 1 ? "text-left" : "text-right"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.plan} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-2 font-body text-slate-700 truncate max-w-xs">{d.plan}</td>
                <td className="px-4 py-2 font-body text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: d.catColor }} />
                  {d.catLabel}
                </td>
                <td className="px-4 py-2 text-right font-body text-slate-600">{d.count}</td>
                <td className="px-4 py-2 text-right font-body font-medium text-slate-900">{d.active}</td>
                <td className="px-4 py-2 text-right font-body text-emerald-600">{d.newInPeriod}</td>
                <td className="px-4 py-2 text-right font-body text-slate-600">{d.price > 0 ? formatMoney(d.price, 2) : "—"}</td>
                <td className="px-4 py-2 text-right font-body text-slate-500">{d.annual ? "Yearly" : "Monthly"}</td>
                <td className="px-4 py-2 text-right font-body font-medium text-slate-900">{formatMoney(d.totalPaid)}</td>
                <td className="px-4 py-2 text-right font-body text-slate-500">{d.active > 0 ? formatMoney(d.arpu, 2) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-medium">
              <td className="px-4 py-2 font-body text-slate-900" colSpan={3}>Total</td>
              <td className="px-4 py-2 text-right font-body text-slate-900">{totals.active}</td>
              <td className="px-4 py-2 text-right font-body text-emerald-600">{totals.newInPeriod}</td>
              <td colSpan={2} />
              <td className="px-4 py-2 text-right font-body text-slate-900">{formatMoney(totals.totalPaid)}</td>
              <td className="px-4 py-2 text-right font-body text-slate-500">{totals.active > 0 ? formatMoney(totals.totalPaid / totals.active, 2) : "—"}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}