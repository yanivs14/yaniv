import React, { useMemo } from "react";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

export default function PricingMetrics({ contacts }) {
  const data = useMemo(() => {
    const planStats = {};
    for (const c of contacts) {
      if (!c.is_paying_customer || c.is_churned) continue;
      const plan = c.purchase_plan || "Unknown";
      const match = plan.match(/\$(\d+(?:\.\d+)?)/);
      const price = match ? parseFloat(match[1]) : 0;
      const isAnnual = plan.toLowerCase().includes("year") || plan.toLowerCase().includes("annual");
      const monthlyRev = isAnnual ? price / 12 : price;
      if (!planStats[plan]) planStats[plan] = { count: 0, totalMonthly: 0, price, isAnnual };
      planStats[plan].count++;
      planStats[plan].totalMonthly += monthlyRev;
    }
    return Object.entries(planStats)
      .map(([plan, s]) => ({ plan, ...s, avgPerUser: s.count > 0 ? s.totalMonthly / s.count : 0 }))
      .sort((a, b) => b.totalMonthly - a.totalMonthly);
  }, [contacts]);

  const totals = data.reduce((s, d) => ({ count: s.count + d.count, monthly: s.monthly + d.totalMonthly }), { count: 0, monthly: 0 });
  const arpu = totals.count > 0 ? totals.monthly / totals.count : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-body font-semibold text-slate-900">Per-User Pricing Metrics</p>
          <p className="text-[11px] text-slate-400">Active users by plan, price & monthly revenue contribution</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">ARPU (monthly equiv.)</p>
          <p className="text-lg font-bold font-body text-teal-600">{formatMoney(arpu, 2)}</p>
        </div>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-100">
              {["Plan", "Users", "Price", "Billing", "Monthly Rev", "ARPU / User"].map((h, i) => (
                <th key={h} className={`px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.plan} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-2 font-body text-slate-700 truncate max-w-xs">{d.plan}</td>
                <td className="px-4 py-2 text-right font-body text-slate-900">{d.count}</td>
                <td className="px-4 py-2 text-right font-body text-slate-600">{d.price > 0 ? formatMoney(d.price, 2) : "—"}</td>
                <td className="px-4 py-2 text-right font-body text-slate-500">{d.isAnnual ? "Annual" : "Monthly"}</td>
                <td className="px-4 py-2 text-right font-body font-medium text-slate-900">{formatMoney(d.totalMonthly)}</td>
                <td className="px-4 py-2 text-right font-body text-slate-500">{formatMoney(d.avgPerUser, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}