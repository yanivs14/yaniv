import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, ArrowDown } from "lucide-react";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

const STAGE_COLORS = [
  "#0d9488",
  "#0f766e",
  "#d97706",
  "#dc2626",
  "#7c3aed",
];

export default function FunnelStages({ stages, compStages, comparison }) {
  const maxValue = Math.max(...stages.filter(s => !s.isMoney).map(s => s.value), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-body font-bold text-slate-900">Conversion Funnel</p>
          <p className="text-xs text-slate-400 mt-0.5">Highest stage → lowest · each stage shows count, source, and drop-off from previous</p>
        </div>
      </div>

      <div className="space-y-1">
        {stages.map((stage, i) => {
          const prevStage = i > 0 ? stages[i - 1] : null;
          const convRate = prevStage && !prevStage.isMoney && prevStage.value > 0
            ? (stage.isMoney ? stage.value / prevStage.value : stage.value / prevStage.value) * 100
            : null;
          const dropOff = prevStage && !prevStage.isMoney && !stage.isMoney
            ? prevStage.value - stage.value
            : null;
          const dropPct = prevStage && !prevStage.isMoney && !stage.isMoney && prevStage.value > 0
            ? (1 - stage.value / prevStage.value) * 100
            : null;

          const barWidth = stage.isMoney ? 100 : (stage.value / maxValue) * 100;
          const compBarWidth = comparison && compStages && !stage.isMoney && compStages[i]
            ? (compStages[i].value / maxValue) * 100
            : 0;
          const compValue = comparison && compStages ? compStages[i]?.value : null;
          const changePct = comparison && compStages && compStages[i] && compStages[i].value > 0
            ? ((stage.value - compStages[i].value) / compStages[i].value) * 100
            : null;

          return (
            <div key={stage.key}>
              {/* Drop-off indicator between stages */}
              {prevStage && (
                <div className="flex items-center gap-2 py-1.5 pl-4">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                  {dropOff !== null && dropPct !== null ? (
                    <span className="text-[11px] font-body text-slate-500">
                      <span className="font-semibold text-slate-700">{convRate.toFixed(1)}%</span> conversion · {" "}
                      <span className="text-red-500 font-semibold">{dropOff.toLocaleString()} dropped</span> ({dropPct.toFixed(0)}% drop-off)
                    </span>
                  ) : stage.isMoney ? (
                    <span className="text-[11px] font-body text-slate-500">
                      <span className="font-semibold text-slate-700">${(stage.value / (prevStage.value || 1)).toFixed(0)}</span> ARPU per customer
                    </span>
                  ) : null}
                </div>
              )}

              {/* Stage bar */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  {/* Bar */}
                  <div className="flex-1 relative h-14 bg-slate-50 rounded-lg overflow-hidden">
                    {/* Comparison bar (background) */}
                    {comparison && compBarWidth > 0 && (
                      <div className="absolute inset-y-0 left-0 bg-slate-200 rounded-lg transition-all duration-500"
                        style={{ width: `${Math.max(compBarWidth, 2)}%` }} />
                    )}
                    {/* Current bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(barWidth, 2)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                      className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3"
                      style={{ backgroundColor: STAGE_COLORS[i] }}
                    >
                      <div className="text-white">
                        <p className="text-[10px] font-body font-medium opacity-90">{stage.label}</p>
                        <p className="text-lg font-body font-bold leading-tight">
                          {stage.isMoney ? formatMoney(stage.value) : stage.value.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>

                    {/* Comparison value label */}
                    {comparison && compValue !== null && compValue !== undefined && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-right">
                        <p className="text-[9px] text-slate-400 font-body">prev: {stage.isMoney ? formatMoney(compValue) : compValue.toLocaleString()}</p>
                        {changePct !== null && (
                          <p className={`text-[9px] font-body font-bold ${changePct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {changePct >= 0 ? "↑" : "↓"} {Math.abs(changePct).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Source info */}
                <div className="flex items-center gap-2 mt-1 pl-1">
                  <span className="text-[10px] text-slate-400 font-body">{stage.source}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-[10px] text-slate-400 font-body">{stage.description}</span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Overall conversion */}
      {stages.length >= 4 && stages[0].value > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Overall Conv. (Lead→Buy)</p>
            <p className="text-lg font-body font-bold text-teal-600">
              {((stages[3].value / stages[0].value) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Drop-off</p>
            <p className="text-lg font-body font-bold text-red-500">
              {(stages[0].value - stages[3].value).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">ARPU</p>
            <p className="text-lg font-body font-bold text-slate-900">
              {stages[3].value > 0 ? formatMoney(stages[4].value / stages[3].value) : "$0"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Revenue</p>
            <p className="text-lg font-body font-bold text-violet-600">{formatMoney(stages[4].value)}</p>
          </div>
        </div>
      )}
    </div>
  );
}