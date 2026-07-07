import React, { useMemo } from "react";
import { computeFullTrend, formatMoney } from "@/components/admin/email/analytics/helpers";

export default function CohortTable({ contacts, financials }) {
  const trend = useMemo(() => computeFullTrend(contacts, financials), [contacts, financials]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-body font-semibold text-slate-900">Monthly Cohorts</p>
        <p className="text-[11px] text-slate-400">Active, new signups, churned & revenue per month (Jul '24 → today)</p>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-100">
              {['Month', 'Active', 'New', 'Churned', 'Net', 'Revenue', 'Churn %'].map(h => (
                <th key={h} className={`px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase ${h === 'Month' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trend.map(t => {
              const net = t.newSignups - t.cancellations;
              return (
                <tr key={t.key} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 font-body text-slate-700">{t.month}</td>
                  <td className="px-4 py-2 text-right font-body text-slate-900">{t.activeMembers}</td>
                  <td className="px-4 py-2 text-right font-body text-emerald-600">{t.newSignups}</td>
                  <td className="px-4 py-2 text-right font-body text-red-500">{t.cancellations}</td>
                  <td className={`px-4 py-2 text-right font-body font-medium ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {net >= 0 ? '+' : ''}{net}
                  </td>
                  <td className="px-4 py-2 text-right font-body text-slate-900">{formatMoney(t.revenue)}</td>
                  <td className="px-4 py-2 text-right font-body text-xs text-slate-500">{(t.cancellationRate || 0).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}