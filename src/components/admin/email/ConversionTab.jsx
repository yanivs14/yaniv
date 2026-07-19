import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Percent, Globe, ShoppingBag, DollarSign, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm, fetchSkoolUploads, mergeSkoolIntoCrm, filterStripeFinancials } from "@/lib/crmData";
import ConversionStatCard from "./ConversionStatCard";
import ConversionByPlan, { getPurchasesByPlan } from "./ConversionByPlan";
import ConversionBySource from "./ConversionBySource";
import ConversionByPage from "./ConversionByPage";

const DATE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "365 days", days: 365 },
];

export default function ConversionTab() {
  const [gaData, setGaData] = useState(null);
  const [crmData, setCrmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(90);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
      const dateRange = { created_after: from, created_before: today };

      const [gaRes, crm] = await Promise.all([
        base44.functions.invoke("getAnalyticsConversion", { date_from: from, date_to: today }),
        fetchCrmOnly(),
      ]);
      setGaData(gaRes.data);

      let merged = crm;
      try {
        const uploads = await fetchSkoolUploads();
        const active = uploads.find((u) => u.is_active);
        if (active?.data) merged = mergeSkoolIntoCrm({ ...merged }, active.data, dateRange);
      } catch {}
      try {
        const stripeData = await fetchStripeOnly(dateRange);
        const filtered = filterStripeFinancials(stripeData, dateRange);
        merged = mergeStripeIntoCrm({ ...merged }, filtered);
      } catch {}
      setCrmData(merged);
    } catch (e) {
      setError(e.message || "Failed to load conversion data");
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const purchasesByPlan = useMemo(() => {
    if (!gaData || !crmData) return [];
    return getPurchasesByPlan(
      crmData.contacts || [],
      gaData.date_range.start,
      gaData.date_range.end
    );
  }, [gaData, crmData]);

  const totals = gaData?.totals || {};
  const bySource = gaData?.by_source || [];
  const byPage = gaData?.by_page || [];
  const totalSessions = totals.sessions || 0;
  const totalPurchases = purchasesByPlan.reduce((sum, p) => sum + p.count, 0);
  const conversionRate = totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0;
  const totalRevenue = (crmData?.financials?.total_revenue || 0) + (crmData?.financials?.skool_revenue || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-body font-semibold mb-2">Failed to load conversion data</p>
          <p className="text-red-500 text-sm font-body mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-body">Conversion Rates</h2>
          <p className="text-sm text-slate-500 font-body">
            Visitors → Purchases analysis from Google Analytics · {gaData?.property_name || "GA4"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 font-body bg-white text-slate-900"
          >
            {DATE_OPTIONS.map((opt) => (
              <option key={opt.days} value={opt.days}>
                {opt.label}
              </option>
            ))}
          </select>
          <button onClick={loadData} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ConversionStatCard icon={Globe} label="Sessions" value={totalSessions.toLocaleString()} color="text-blue-600" bg="bg-blue-50" />
        <ConversionStatCard icon={ShoppingBag} label="Purchases" value={totalPurchases.toLocaleString()} color="text-emerald-600" bg="bg-emerald-50" />
        <ConversionStatCard icon={Percent} label="Conversion Rate" value={`${conversionRate.toFixed(2)}%`} color="text-teal-600" bg="bg-teal-50" />
        <ConversionStatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Breakdown tables */}
      <ConversionByPlan purchasesByPlan={purchasesByPlan} totalSessions={totalSessions} />
      <ConversionBySource bySource={bySource} />
      <ConversionByPage byPage={byPage} />

      {/* Info note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500 font-body">
          <strong className="text-slate-700">Data Sources:</strong> Sessions and traffic sources from Google Analytics 4.
          Purchases from Stripe + Skool (filtered by first payment date in range). Overall Conversion Rate = Purchases ÷
          Sessions × 100. Per-source conversion uses GA4's own conversion tracking (purchase events).
        </p>
      </div>
    </div>
  );
}