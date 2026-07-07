import React from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

export default function FunnelByPage({ byPage }) {
  if (!byPage || byPage.length === 0) return null;

  const maxLeads = Math.max(...byPage.map(p => p.leads), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-body font-bold text-slate-900">Funnel by Landing Page</p>
        <p className="text-xs text-slate-400 mt-0.5">Side-by-side comparison — which page converts best</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {byPage.map((page, i) => {
          const convRate = page.leads > 0 ? (page.purchased / page.leads) * 100 : 0;
          const barWidth = (page.leads / maxLeads) * 100;

          return (
            <motion.div
              key={page.page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="border border-slate-200 rounded-lg p-3"
            >
              <p className="text-sm font-body font-bold text-slate-900 mb-2">{page.label}</p>

              {/* Mini funnel bars */}
              <div className="space-y-1.5 mb-3">
                {[
                  { label: "Leads", value: page.leads, color: "#0d9488", width: 100 },
                  { label: "Quiz", value: page.quiz, color: "#0f766e", width: page.leads > 0 ? (page.quiz / page.leads) * 100 : 0 },
                  { label: "Meetings", value: page.meetings, color: "#d97706", width: page.leads > 0 ? (page.meetings / page.leads) * 100 : 0 },
                  { label: "Purchased", value: page.purchased, color: "#dc2626", width: page.leads > 0 ? (page.purchased / page.leads) * 100 : 0 },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-body w-16 flex-shrink-0">{s.label}</span>
                    <div className="flex-1 h-5 bg-slate-50 rounded overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 rounded transition-all duration-500 flex items-center px-1.5"
                        style={{ width: `${Math.max(s.width, 3)}%`, backgroundColor: s.color }}>
                        <span className="text-[9px] text-white font-body font-bold">{s.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion + revenue */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Conv. Rate</p>
                  <p className={`text-sm font-body font-bold ${convRate >= 10 ? "text-emerald-600" : convRate >= 3 ? "text-amber-600" : "text-slate-400"}`}>
                    {convRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase">Revenue</p>
                  <p className="text-sm font-body font-bold text-violet-600">{formatMoney(page.revenue)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}