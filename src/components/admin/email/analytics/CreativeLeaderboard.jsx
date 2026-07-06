import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CreativeLeaderboard({ contacts }) {
  const leaderboard = useMemo(() => {
    const recs = {};
    for (const c of contacts) {
      const rec = c.quiz_recommendation || "Unknown";
      if (!recs[rec]) recs[rec] = { leads: 0, paying: 0, revenue: 0 };
      recs[rec].leads += 1;
      if (c.is_paying_customer) { recs[rec].paying += 1; recs[rec].revenue += c.total_paid || 0; }
    }
    return Object.entries(recs)
      .map(([rec, data]) => ({ recommendation: rec, ...data, conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0, arpu: data.paying > 0 ? data.revenue / data.paying : 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [contacts]);

  const maxRevenue = leaderboard[0]?.revenue || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm font-body font-semibold text-slate-900 mb-1">Creative & Messaging Leaderboard</p>
      <p className="text-xs text-slate-400 mb-4">Ranked by revenue. Based on quiz recommendation data.</p>
      <div className="space-y-3">
        {leaderboard.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="border border-slate-200 rounded-xl p-3 hover:border-teal-300 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              {idx < 3 ? (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${idx === 0 ? "bg-amber-100" : idx === 1 ? "bg-slate-200" : "bg-orange-100"}`}>
                  <Trophy className={`w-3.5 h-3.5 ${idx === 0 ? "text-amber-600" : idx === 1 ? "text-slate-500" : "text-orange-500"}`} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                </div>
              )}
              <p className="text-sm font-body font-semibold text-slate-900 truncate flex-1">{item.recommendation}</p>
              <p className="text-sm font-bold text-emerald-600 flex-shrink-0">{formatMoney(item.revenue)}</p>
            </div>
            <div className="flex items-center gap-4 ml-10 text-xs text-slate-500">
              <span>{item.leads} leads</span>
              <span className="text-emerald-600">{item.paying} paying</span>
              <span className="text-teal-600">{item.conversionRate.toFixed(1)}% conv.</span>
              <span>{formatMoney(item.arpu)} ARPU</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 ml-10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(item.revenue / maxRevenue) * 100}%` }} transition={{ duration: 0.5, delay: idx * 0.05 + 0.2 }} className="h-full bg-teal-500 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}