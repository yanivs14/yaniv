import React, { useState, useMemo } from "react";
import SubscriptionControls from "./subscription/SubscriptionControls";
import PlanSummaryCards from "./subscription/PlanSummaryCards";
import PlanTrendChart from "./subscription/PlanTrendChart";
import PlanBreakdownCards from "./subscription/PlanBreakdownCards";
import PlanDetailTable from "./subscription/PlanDetailTable";
import ExportButton from "./ExportButton";
import {
  generatePeriods, getComparisonRange,
  computePlanUserTrend, computePlanRevenueTrend,
  SUB_PLAN_CATEGORIES,
} from "@/lib/trendUtils";

export default function SubscriptionPricing({ contacts, financials }) {
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState("2024-07-01");
  const [dateTo, setDateTo] = useState(today);
  const [interval, setInterval] = useState("monthly");
  const [comparison, setComparison] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [metric, setMetric] = useState("users");

  const periods = useMemo(() => generatePeriods(dateFrom, dateTo, interval), [dateFrom, dateTo, interval]);
  const userTrend = useMemo(() => computePlanUserTrend(contacts, periods, interval), [contacts, periods, interval]);
  const revTrend = useMemo(() => computePlanRevenueTrend(financials.daily_data, financials.product_monthly, financials.monthly_data, periods, interval), [financials, periods, interval]);

  const planSummary = useMemo(() => {
    const summary = {};
    const lastUser = userTrend[userTrend.length - 1] || {};
    for (const cat of Object.keys(SUB_PLAN_CATEGORIES)) {
      summary[cat] = {
        active: lastUser[`${cat}_active`] || 0,
        revenue: revTrend.reduce((s, r) => s + (r[`${cat}_revenue`] || 0), 0),
        newSignups: userTrend.reduce((s, u) => s + (u[`${cat}_new`] || 0), 0),
        churned: userTrend.reduce((s, u) => s + (u[`${cat}_churned`] || 0), 0),
      };
    }
    return summary;
  }, [userTrend, revTrend]);

  const totalRevenue = revTrend.reduce((s, r) => s + (r.total_revenue || 0), 0);
  const totalActive = (userTrend[userTrend.length - 1] || {}).total_active || 0;

  const compData = useMemo(() => {
    if (!comparison) return null;
    const comp = getComparisonRange(dateFrom, dateTo);
    const compPeriods = generatePeriods(comp.from, comp.to, interval);
    return {
      userTrend: computePlanUserTrend(contacts, compPeriods, interval),
      revTrend: computePlanRevenueTrend(financials.daily_data, financials.product_monthly, financials.monthly_data, compPeriods, interval),
    };
  }, [comparison, dateFrom, dateTo, interval, contacts, financials]);

  const exportRaw = useMemo(() => {
    return userTrend.map((u, i) => {
      const r = revTrend[i] || {};
      const row = { period: u.label };
      for (const cat of Object.keys(SUB_PLAN_CATEGORIES)) {
        row[`${cat}_active`] = u[`${cat}_active`] || 0;
        row[`${cat}_new`] = u[`${cat}_new`] || 0;
        row[`${cat}_churned`] = u[`${cat}_churned`] || 0;
        row[`${cat}_revenue`] = r[`${cat}_revenue`] || 0;
      }
      row.total_active = u.total_active || 0;
      row.total_revenue = r.total_revenue || 0;
      return row;
    });
  }, [userTrend, revTrend]);

  const exportSummary = useMemo(() => {
    return Object.entries(SUB_PLAN_CATEGORIES).map(([key, meta]) => {
      const s = planSummary[key] || {};
      return {
        plan: meta.label,
        active_users: s.active || 0,
        revenue: Math.round(s.revenue || 0),
        new_signups: s.newSignups || 0,
        churned: s.churned || 0,
        net_growth: (s.newSignups || 0) - (s.churned || 0),
        arpu: s.active > 0 ? (s.revenue / s.active).toFixed(2) : 0,
      };
    });
  }, [planSummary]);

  return (
    <div className="space-y-4">
      <SubscriptionControls
        dateFrom={dateFrom} dateTo={dateTo} interval={interval} comparison={comparison}
        chartType={chartType} metric={metric}
        onDateFromChange={setDateFrom} onDateToChange={setDateTo}
        onIntervalChange={setInterval} onComparisonChange={setComparison}
        onChartTypeChange={setChartType} onMetricChange={setMetric}
      />

      <div className="flex justify-end gap-2">
        <ExportButton data={exportRaw} filename="subscription_raw_trend" label="Export Raw Data" />
        <ExportButton data={exportSummary} filename="subscription_summary" label="Export Summary" />
      </div>

      <PlanSummaryCards planSummary={planSummary} totalRevenue={totalRevenue} totalActive={totalActive} />

      <PlanTrendChart
        userTrend={userTrend} revTrend={revTrend}
        chartType={chartType} metric={metric}
        compUserTrend={compData?.userTrend} compRevTrend={compData?.revTrend}
      />

      <PlanBreakdownCards planSummary={planSummary} userTrend={userTrend} revTrend={revTrend} metric={metric} />

      <PlanDetailTable contacts={contacts} dateFrom={dateFrom} dateTo={dateTo} />

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-body font-bold text-slate-900 mb-2">Data Sources & Notes</p>
        <ul className="space-y-1.5 text-sm text-slate-600 font-body">
          <li>• <strong>User counts:</strong> Computed from CRM contacts using Stripe first_payment_date & subscription_canceled — shows active, new signups, and churned per period.</li>
          <li>• <strong>Revenue:</strong> From Stripe charges (product_monthly). Per-plan revenue is available from Apr 2026 onward (post-migration). Historical months show aggregate only.</li>
          <li>• <strong>Plan categorization:</strong> Yearly and Annual plans are combined into one "Annual / Yearly" category. Monthly, Promo, and Returning Movers are combined into "Monthly".</li>
          <li>• <strong>Total Paid:</strong> Cumulative (all-time) per contact, not period-specific.</li>
          <li>• <strong>Comparison:</strong> When enabled, dashed line shows the previous equivalent period's total.</li>
        </ul>
      </div>
    </div>
  );
}