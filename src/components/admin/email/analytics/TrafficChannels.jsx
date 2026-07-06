import React, { useMemo } from "react";
import { Globe } from "lucide-react";

const SOURCE_LABELS = {
  quiz: "Quiz", inner_circle: "Inner Circle", newsletter: "Newsletter",
  kit: "Kit", hubspot: "HubSpot", stripe: "Stripe", skool: "Skool",
};

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function TrafficChannels({ contacts }) {
  const bySource = useMemo(() => {
    const sources = {};
    for (const c of contacts) {
      const src = c.source || "unknown";
      if (!sources[src]) sources[src] = { leads: 0, paying: 0, revenue: 0 };
      sources[src].leads += 1;
      if (c.is_paying_customer) { sources[src].paying += 1; sources[src].revenue += c.total_paid || 0; }
    }
    return Object.entries(sources)
      .map(([src, data]) => ({ source: src, ...data, conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0, arpu: data.paying > 0 ? data.revenue / data.paying : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
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
      .map(([country, data]) => ({ country, ...data, conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0 }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 15);
  }, [contacts]);

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm overflow-x-auto">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Per-Channel Performance</p>
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-xs text-slate-400 uppercase border-b border-slate-200">
              <th className="text-left py-2">Channel</th>
              <th className="text-right py-2">Leads</th>
              <th className="text-right py-2">Paying</th>
              <th className="text-right py-2">Conv. Rate</th>
              <th className="text-right py-2">Revenue</th>
              <th className="text-right py-2">ARPU</th>
            </tr>
          </thead>
          <tbody>
            {bySource.map((s, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 text-slate-700 font-medium">{SOURCE_LABELS[s.source] || s.source}</td>
                <td className="py-2 text-right text-slate-600">{s.leads}</td>
                <td className="py-2 text-right text-emerald-600 font-semibold">{s.paying}</td>
                <td className="py-2 text-right text-teal-600">{s.conversionRate.toFixed(1)}%</td>
                <td className="py-2 text-right text-slate-900 font-semibold">{formatMoney(s.revenue)}</td>
                <td className="py-2 text-right text-slate-500">{formatMoney(s.arpu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <td className="py-2 text-slate-700 flex items-center gap-1.5"><Globe className="w-3 h-3 text-slate-400" /> {c.country}</td>
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