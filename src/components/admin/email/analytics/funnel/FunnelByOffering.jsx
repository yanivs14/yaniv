import React from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

const OFFERING_COLORS = {
  monthly: "#0d9488",
  annual: "#f59e0b",
  one_time: "#6366f1",
  inner_circle: "#8b5cf6",
  handstand: "#ec4899",
  other: "#94a3b8",
};

export default function FunnelByOffering({ byOffering }) {
  if (!byOffering || byOffering.length === 0) return null;

  const maxCustomers = Math.max(...byOffering.map(o => o.customers), 1);
  const totalRevenue = byOffering.reduce((s, o) => s + o.revenue, 0);
  const totalCustomers = byOffering.reduce((s, o) => s + o.customers, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-body font-bold text-slate-900">Purchases by Offering</p>
        <p className="text-xs text-slate-400 mt-0.5">Which pricing plan drives the most customers and revenue in this period</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {byOffering.map((offering, i) => {
          const barWidth = (offering.customers / maxCustomers) * 100;
          const revShare = totalRevenue > 0 ? (offering.revenue / totalRevenue) * 100 : 0;

          return (
            <motion.div
              key={offering.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="border border-slate-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: OFFERING_COLORS[offering.key] || "#94a3b8" }} />
                <p className="text-sm font-body font-bold text-slate-900">{offering.label}</p>
              </div>

              <div className="h-8 bg-slate-50 rounded overflow-hidden relative mb-2">
                <div className="absolute inset-y-0 left-0 rounded transition-all duration-500 flex items-center px-2"
                  style={{ width: `${Math.max(barWidth, 3)}%`, backgroundColor: OFFERING_COLORS[offering.key] || "#94a3b8" }}>
                  <span className="text-[10px] text-white font-body font-bold">{offering.customers}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">Revenue</p>
                  <p className="text-sm font-body font-bold text-violet-600">{formatMoney(offering.revenue)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">ARPU</p>
                  <p className="text-sm font-body font-bold text-slate-900">{formatMoney(offering.arpu)}</p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-body">
                  <span>Rev. share</span>
                  <span className="font-bold text-slate-600">{revShare.toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-center">
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Total Customers</p>
          <p className="text-lg font-body font-bold text-slate-900">{totalCustomers.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Total Revenue</p>
          <p className="text-lg font-body font-bold text-violet-600">{formatMoney(totalRevenue)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase">Blended ARPU</p>
          <p className="text-lg font-body font-bold text-teal-600">{totalCustomers > 0 ? formatMoney(totalRevenue / totalCustomers) : "$0"}</p>
        </div>
      </div>
    </div>
  );
}