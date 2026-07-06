import React, { useMemo } from "react";
import { motion } from "framer-motion";

const SOURCE_LABELS = {
  quiz: "Quiz", inner_circle: "Inner Circle", newsletter: "Newsletter",
  kit: "Kit", hubspot: "HubSpot", stripe: "Stripe", skool: "Skool",
};

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function LandingFunnel({ contacts }) {
  const funnelData = useMemo(() => {
    const totalLeads = contacts.length;
    const quizLeads = contacts.filter(c => c.source === "quiz").length;
    const totalPaying = contacts.filter(c => c.is_paying_customer).length;
    return { totalLeads, quizLeads, totalPaying };
  }, [contacts]);

  const stages = [
    { label: "Total Leads", value: funnelData.totalLeads, color: "bg-blue-500", width: 100 },
    { label: "Quiz Completions", value: funnelData.quizLeads, color: "bg-teal-500", width: funnelData.totalLeads > 0 ? (funnelData.quizLeads / funnelData.totalLeads) * 100 : 0 },
    { label: "Paying Customers", value: funnelData.totalPaying, color: "bg-emerald-500", width: funnelData.totalLeads > 0 ? (funnelData.totalPaying / funnelData.totalLeads) * 100 : 0 },
  ];

  const bySource = useMemo(() => {
    const sources = {};
    for (const c of contacts) {
      const src = c.source || "unknown";
      if (!sources[src]) sources[src] = { leads: 0, paying: 0, revenue: 0 };
      sources[src].leads += 1;
      if (c.is_paying_customer) { sources[src].paying += 1; sources[src].revenue += c.total_paid || 0; }
    }
    return Object.entries(sources)
      .map(([src, data]) => ({ source: src, ...data, conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0 }))
      .sort((a, b) => b.leads - a.leads);
  }, [contacts]);

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-sm font-body font-semibold text-slate-900 mb-4">Conversion Funnel</p>
        <div className="space-y-3">
          {stages.map((stage, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-body text-slate-700">{stage.label}</span>
                <span className="text-sm font-bold text-slate-900">{stage.value}</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${stage.width}%` }} transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }} className={`h-full ${stage.color} rounded-lg flex items-center px-3`}>
                  <span className="text-xs text-white font-semibold">{stage.width > 10 ? `${stage.width.toFixed(1)}%` : ""}</span>
                </motion.div>
              </div>
              {i < stages.length - 1 && (
                <p className="text-[11px] text-slate-400 mt-1 ml-1">
                  ↓ {stages[i + 1].value} of {stage.value} ({stage.value > 0 ? ((stages[i + 1].value / stage.value) * 100).toFixed(1) : 0}%)
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-x-auto">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Funnel by Source</p>
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-xs text-slate-400 uppercase border-b border-slate-200">
              <th className="text-left py-2">Source</th>
              <th className="text-right py-2">Leads</th>
              <th className="text-right py-2">Paying</th>
              <th className="text-right py-2">Conv. Rate</th>
              <th className="text-right py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {bySource.map((s, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 text-slate-700">{SOURCE_LABELS[s.source] || s.source}</td>
                <td className="py-2 text-right text-slate-600">{s.leads}</td>
                <td className="py-2 text-right text-emerald-600 font-semibold">{s.paying}</td>
                <td className="py-2 text-right text-teal-600">{s.conversionRate.toFixed(1)}%</td>
                <td className="py-2 text-right text-slate-900 font-semibold">{formatMoney(s.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}