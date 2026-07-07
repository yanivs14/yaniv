import React, { useState, useMemo } from "react";
import TrendControls from "./trend/TrendControls";
import TrendSummary from "./trend/TrendSummary";
import RevenueChart from "./trend/RevenueChart";
import UsersChart from "./trend/UsersChart";
import MRRChart from "./trend/MRRChart";
import ProductTable from "./trend/ProductTable";
import SourceBreakdown from "./trend/SourceBreakdown";
import PlanTransfers from "./trend/PlanTransfers";
import PricingMetrics from "./trend/PricingMetrics";
import ExportButton from "./ExportButton";
import { generatePeriods, aggregateRevenue, computeUserMetrics, computeMrrTrend, getComparisonRange } from "@/lib/trendUtils";

export default function TrendOverTime({ contacts, financials, stats }) {
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState("2024-07-01");
  const [dateTo, setDateTo] = useState(today);
  const [timeUnit, setTimeUnit] = useState("monthly");
  const [comparison, setComparison] = useState(false);

  const periods = useMemo(() => generatePeriods(dateFrom, dateTo, timeUnit), [dateFrom, dateTo, timeUnit]);
  const revenueData = useMemo(() => aggregateRevenue(financials.daily_data, financials.monthly_data, periods, timeUnit), [financials, periods, timeUnit]);
  const userData = useMemo(() => computeUserMetrics(contacts, periods, timeUnit), [contacts, periods, timeUnit]);
  const mrrData = useMemo(() => computeMrrTrend(contacts, periods, timeUnit), [contacts, periods, timeUnit]);

  const compData = useMemo(() => {
    if (!comparison) return null;
    const comp = getComparisonRange(dateFrom, dateTo);
    const compPeriods = generatePeriods(comp.from, comp.to, timeUnit);
    return {
      range: comp,
      revenue: aggregateRevenue(financials.daily_data, financials.monthly_data, compPeriods, timeUnit),
      users: computeUserMetrics(contacts, compPeriods, timeUnit),
      mrr: computeMrrTrend(contacts, compPeriods, timeUnit),
    };
  }, [comparison, dateFrom, dateTo, timeUnit, contacts, financials]);

  const exportData = useMemo(() => {
    return revenueData.map((r, i) => ({
      period: r.label,
      gross_revenue: Math.round(r.gross),
      net_revenue: Math.round(r.net),
      refunds: Math.round(r.refunds),
      transactions: r.transactions,
      active_users: userData[i]?.active || 0,
      new_users: userData[i]?.new || 0,
      churned: userData[i]?.churned || 0,
      mrr: mrrData[i]?.mrr || 0,
    }));
  }, [revenueData, userData, mrrData]);

  return (
    <div className="space-y-4">
      <TrendControls
        dateFrom={dateFrom}
        dateTo={dateTo}
        interval={timeUnit}
        comparison={comparison}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onIntervalChange={setTimeUnit}
        onComparisonChange={setComparison}
      />
      <div className="flex justify-end">
        <ExportButton data={exportData} filename="trend_overview" label="Export Trend Data" />
      </div>
      <TrendSummary revenueData={revenueData} userData={userData} mrrData={mrrData} compData={compData} />
      <RevenueChart data={revenueData} compData={compData?.revenue} />
      <UsersChart data={userData} compData={compData?.users} />
      <MRRChart data={mrrData} compData={compData?.mrr} />
      <ProductTable productMonthly={financials.product_monthly} dateFrom={dateFrom} dateTo={dateTo} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SourceBreakdown contacts={contacts} />
        <PlanTransfers transfers={financials.plan_transfers} />
      </div>
      <PricingMetrics contacts={contacts} />
    </div>
  );
}