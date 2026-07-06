import React, { useMemo } from "react";
import { Globe } from "lucide-react";

const SOURCE_LABELS = {
  quiz: "Quiz",
  inner_circle: "Inner Circle",
  newsletter: "Newsletter",
  kit: "Kit",
  hubspot: "HubSpot",
  stripe: "Stripe",
  skool: "Skool",
};

function formatMoney(n) {
  if (!n || n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const INSIGHTS = [
  "Reallocate budget toward channels with LTV:CAC well above 3x before scaling further.",
  "Email is nearly free CAC — the list is a dedicated reactivation push, high-ROI, low-cost.",
  "Any channel dropping under 3x for 2+ weeks running gets paused, not just flagged.",
  "Source breakdown per funnel step (not just purchase) shows where each channel actually leaks users.",
];

export default function TrafficChannels({ contacts, financials }) {
  const churnRate = financials?.churn_rate || 0;
  const mrr = financials?.mrr || 0;
  const totalPaying = contacts.filter(c => c.is_paying_customer).length;

  const monthlyARPU = totalPaying > 0 ? mrr / totalPaying : 0;
  const ltv = churnRate > 0 ? monthlyARPU * (100 / churnRate) : monthlyARPU * 12;

  const bySource = useMemo(() => {
    const sources = {};
    for (const c of contacts) {
      const src = c.source || "unknown";
      if (!sources[src]) sources[src] = { leads: 0, paying: 0, revenue: 0 };
      sources[src].leads += 1;
      if (c.is_paying_customer) {
        sources[src].paying += 1;
        sources[src].revenue += c.total_paid || 0;
      }
    }
    return Object.entries(sources)
      .map(([src, data]) => ({
        source: src,
        ...data,
        arpu: data.paying > 0 ? data.revenue / data.paying : 0,
        conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0,
      }))
      .sort((a, b) => b.leads - a.leads);
  }, [contacts]);

  const byCountry = useMemo(() => {
    const countries = {};
    for (const c of contacts) {
      if (!c.country) continue;
      if (!countries[c.country]) countries[c.country] = { leads: 0, paying: 0 };
      countries[c.country].leads += 1;
      if (c.is_paying_customer) countries[c.country].paying += 1;
    }
    return Object.entries(countries)
      .map(([country, data]) => ({
        country,
        ...data,
        conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0,
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 15);
  }, [contacts]);

  return (
    <div>
      {/* Main: table + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mb-4">
        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-slate-900 text-xs text-slate-300 uppercase tracking-wide">
                  <th className="text-left py-2.5 px-4 font-semibold">Channel</th>
                  <th className="text-right py-2.5 px-4 font-semibold">Leads</th>
                  <th className="text-right py-2.5 px-4 font-semibold">Paying</th>
                  <th className="text-right py-2.5 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-2.5 px-4 font-semibold">Conv. Rate</th>
                  <th className="text-right py-2.5 px-4 font-semibold">ARPU</th>
                </tr>
              </thead>
              <tbody>
                {bySource.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-900 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        {SOURCE_LABELS[s.source] || s.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{s.leads.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">{s.paying.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{formatMoney(s.revenue)}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={`font-semibold ${s.conversionRate >= 10 ? "text-emerald-600" : s.conversionRate >= 3 ? "text-amber-600" : "text-slate-400"}`}>
                        {s.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{formatMoney(s.arpu)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
          <p className="text-xs font-body font-bold text-teal-700 uppercase tracking-wide mb-3">What to do here</p>
          <ul className="space-y-3">
            {INSIGHTS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-body leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-teal-600 flex-shrink-0 mt-1.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Country table (preserved) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-x-auto">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Top Countries by Traffic</p>
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-xs text-slate-400 uppercase border-b border-slate-200">
              <th className="text-left py-2">Country</th>
              <th className="text-right py-2">Leads</th>
              <th className="text-right py-2">Paying</th>
              <th className="text-right py-2">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {byCountry.map((c, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-slate-400" /> {c.country}
                </td>
                <td className="py-2 text-right text-slate-600">{c.leads}</td>
                <td className="py-2 text-right text-emerald-600 font-semibold">{c.paying}</td>
                <td className="py-2 text-right text-teal-600">{c.conversionRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}