import React, { useState, useMemo } from "react";
import FunnelControls from "./funnel/FunnelControls";
import FunnelStages from "./funnel/FunnelStages";
import FunnelByPage from "./funnel/FunnelByPage";
import FunnelByOffering from "./funnel/FunnelByOffering";
import ExportButton from "./ExportButton";
import { computeFunnelStages, computeFunnelByPage, computeFunnelByOffering, computePeriodRevenue } from "@/lib/funnelUtils";
import { getComparisonRange } from "@/lib/trendUtils";
import { formatMoney } from "./helpers";

export default function LandingFunnel({ contacts, financials }) {
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState("2024-07-01");
  const [dateTo, setDateTo] = useState(today);
  const [timeUnit, setTimeUnit] = useState("monthly");
  const [comparison, setComparison] = useState(false);
  const [pageFilter, setPageFilter] = useState("all");
  const [offeringFilter, setOfferingFilter] = useState("all");

  const stages = useMemo(
    () => computeFunnelStages(contacts, financials, dateFrom, dateTo, pageFilter, offeringFilter),
    [contacts, financials, dateFrom, dateTo, pageFilter, offeringFilter]
  );

  const compStages = useMemo(() => {
    if (!comparison) return null;
    const comp = getComparisonRange(dateFrom, dateTo);
    return computeFunnelStages(contacts, financials, comp.from, comp.to, pageFilter, offeringFilter);
  }, [comparison, dateFrom, dateTo, pageFilter, offeringFilter, contacts, financials]);

  const byPage = useMemo(
    () => computeFunnelByPage(contacts, financials, dateFrom, dateTo),
    [contacts, financials, dateFrom, dateTo]
  );

  const byOffering = useMemo(
    () => computeFunnelByOffering(contacts, financials, dateFrom, dateTo),
    [contacts, financials, dateFrom, dateTo]
  );

  const exportData = useMemo(() => {
    const data = [{
      period: `${dateFrom} → ${dateTo}`,
      leads: stages[0].value,
      quiz_completed: stages[1].value,
      meetings_booked: stages[2].value,
      purchased: stages[3].value,
      revenue: stages[4].value,
      overall_conversion: stages[0].value > 0 ? (stages[3].value / stages[0].value * 100).toFixed(1) : 0,
      arpu: stages[3].value > 0 ? (stages[4].value / stages[3].value).toFixed(2) : 0,
    }];
    if (compStages) {
      data[0].prev_leads = compStages[0].value;
      data[0].prev_purchased = compStages[3].value;
      data[0].prev_revenue = compStages[4].value;
    }
    return data;
  }, [stages, compStages, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      <FunnelControls
        dateFrom={dateFrom} dateTo={dateTo} interval={timeUnit} comparison={comparison}
        pageFilter={pageFilter} offeringFilter={offeringFilter}
        onDateFromChange={setDateFrom} onDateToChange={setDateTo} onIntervalChange={setTimeUnit}
        onComparisonChange={setComparison} onPageChange={setPageFilter} onOfferingChange={setOfferingFilter}
      />

      <div className="flex justify-end">
        <ExportButton data={exportData} filename="landing_funnel" label="Export Funnel Data" />
      </div>

      <FunnelStages stages={stages} compStages={compStages} comparison={comparison} />

      <FunnelByPage byPage={byPage} />

      <FunnelByOffering byOffering={byOffering} />

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-3">Data Sources & Definitions</p>
        <ul className="space-y-2 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Leads:</strong> All form submissions (CRM Lead entity) created in the selected period — quiz, inner circle, newsletter.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Quiz Completed:</strong> Subset of leads with <code>source = quiz</code> or quiz answers present.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Meetings Booked:</strong> Leads with <code>meeting_scheduled = true</code> and meeting date in period (Calendly integration).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Purchased:</strong> Contacts with <code>first_payment_date</code> in the selected period (Stripe).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Revenue:</strong> Net Stripe charges in period (daily_data + monthly_data for historical months).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>Conversion rate (stage-to-stage):</strong> Current stage count ÷ previous stage count × 100. Drop-off = previous − current.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span><strong>ARPU:</strong> Revenue ÷ number of purchasers in the period.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}