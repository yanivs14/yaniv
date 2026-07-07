import React from "react";
import TrendControls from "../trend/TrendControls";
import { BarChart3, LineChart as LineIcon, AreaChart, Layers } from "lucide-react";

const CHART_TYPES = [
  { key: "bar", label: "Bar", icon: BarChart3 },
  { key: "line", label: "Line", icon: LineIcon },
  { key: "area", label: "Area", icon: AreaChart },
  { key: "stacked", label: "Stacked", icon: Layers },
];

const METRICS = [
  { key: "users", label: "Users" },
  { key: "revenue", label: "Revenue" },
];

export default function SubscriptionControls({
  dateFrom, dateTo, interval, comparison, chartType, metric,
  onDateFromChange, onDateToChange, onIntervalChange, onComparisonChange,
  onChartTypeChange, onMetricChange,
}) {
  return (
    <div className="space-y-2">
      <TrendControls
        dateFrom={dateFrom} dateTo={dateTo} interval={interval} comparison={comparison}
        onDateFromChange={onDateFromChange} onDateToChange={onDateToChange}
        onIntervalChange={onIntervalChange} onComparisonChange={onComparisonChange}
      />
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {METRICS.map(m => (
            <button key={m.key} onClick={() => onMetricChange(m.key)}
              className={`px-3 py-1 text-xs font-body font-medium rounded-md transition-colors ${metric === m.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {CHART_TYPES.map(ct => {
            const Icon = ct.icon;
            return (
              <button key={ct.key} onClick={() => onChartTypeChange(ct.key)} title={ct.label}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartType === ct.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
        <span className="text-[10px] text-slate-400 ml-auto">Annual & Yearly plans are combined</span>
      </div>
    </div>
  );
}