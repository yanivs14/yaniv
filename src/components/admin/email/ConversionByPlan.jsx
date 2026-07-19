import React from "react";
import { Package } from "lucide-react";

function categorizePlan(plan) {
  if (!plan) return "Unknown";
  const p = plan.toLowerCase();
  if (p.includes("handstand 4 life") || p.includes("handstand_4_life")) return "Handstand 4 Life";
  if (p.includes("handstand")) return "Handstand Course";
  if (p.includes("inner circle")) return "Inner Circle";
  if (p.includes("annual")) return "Annual";
  if (p.includes("promo")) return "Promo";
  if (p.includes("monthly")) return "Monthly";
  return "Other";
}

export function getPurchasesByPlan(contacts, startDate, endDate) {
  const planMap = new Map();
  let total = 0;
  for (const c of contacts) {
    if (!c.is_paying_customer) continue;
    const paymentDate = c.first_payment_date?.slice(0, 10);
    if (paymentDate && paymentDate >= startDate && paymentDate <= endDate) {
      const plan = categorizePlan(c.purchase_plan);
      planMap.set(plan, (planMap.get(plan) || 0) + 1);
      total++;
    }
  }
  return Array.from(planMap.entries())
    .map(([plan, count]) => ({ plan, count, pct: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

export default function ConversionByPlan({ purchasesByPlan, totalSessions }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Package className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-bold text-slate-900 font-body">Conversion by Plan</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase">Plan</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Purchases</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">% of Purchases</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {purchasesByPlan.map(({ plan, count, pct }) => (
              <tr key={plan} className="border-t border-slate-100">
                <td className="px-4 py-2.5 text-sm font-body text-slate-900 font-medium">{plan}</td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-700 text-right">{count}</td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-500 text-right">{pct.toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-sm font-body text-teal-600 font-semibold text-right">
                  {totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(2) : 0}%
                </td>
              </tr>
            ))}
            {purchasesByPlan.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                  No purchases in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}