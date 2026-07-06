import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

function formatMoney(n) {
  if (!n || n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const INSIGHTS = [
  "For Paid — reallocate budget weekly, not monthly.",
  "Kill anything below 0.5x average CVR after $500 spend.",
  "Tag every creative by format, placement, and concept so patterns (not just single winners) emerge over time.",
  "Feed winning concepts back to team — this screen should shape the content calendar.",
];

export default function CreativeLeaderboard({ contacts }) {
  const leaderboard = useMemo(() => {
    const recs = {};
    for (const c of contacts) {
      const rec = c.quiz_recommendation || "Unknown";
      if (!recs[rec]) recs[rec] = { leads: 0, paying: 0, revenue: 0 };
      recs[rec].leads += 1;
      if (c.is_paying_customer) {
        recs[rec].paying += 1;
        recs[rec].revenue += c.total_paid || 0;
      }
    }
    return Object.entries(recs)
      .map(([rec, data]) => ({
        recommendation: rec,
        ...data,
        conversionRate: data.leads > 0 ? (data.paying / data.leads) * 100 : 0,
        arpu: data.paying > 0 ? data.revenue / data.paying : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [contacts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      {/* Ranked list */}
      <div className="space-y-2.5">
        {leaderboard.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-body">No creative/messaging data available</p>
          </div>
        ) : (
          leaderboard.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-teal-300 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${idx === 0 ? "bg-amber-500" : "bg-slate-600"}`}>
                  {idx + 1}
                </div>
                {/* Media icon */}
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                </div>
                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-semibold text-slate-900 truncate">{item.recommendation}</p>
                </div>
                {/* Metrics */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-slate-400 font-body">Spend: —</p>
                  <p className="text-[11px] text-slate-500 font-body">{item.leads.toLocaleString()} traffic</p>
                  <p className="text-[11px] font-body">
                    <span className="text-slate-500">{item.paying} conv · </span>
                    <span className="text-teal-600 font-semibold">{item.conversionRate.toFixed(1)}% CVR</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
  );
}