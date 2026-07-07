import React from "react";
import { INTERVALS } from "@/lib/trendUtils";
import { Calendar, GitCompare } from "lucide-react";

export default function TrendControls({ dateFrom, dateTo, interval, comparison, onDateFromChange, onDateToChange, onIntervalChange, onComparisonChange }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input type="date" value={dateFrom} max={dateTo} onChange={e => onDateFromChange(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-body text-slate-900 focus:outline-none focus:border-teal-500" />
          <span className="text-slate-400 text-sm">→</span>
          <input type="date" value={dateTo} min={dateFrom} max={today} onChange={e => onDateToChange(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-body text-slate-900 focus:outline-none focus:border-teal-500" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {INTERVALS.map(int => (
            <button
              key={int.key}
              onClick={() => onIntervalChange(int.key)}
              className={`px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors ${interval === int.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title={int.fullLabel}
            >
              {int.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onComparisonChange(!comparison)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium rounded-lg border transition-colors ${comparison ? "bg-teal-50 border-teal-300 text-teal-700" : "border-slate-200 text-slate-500 hover:text-slate-700"}`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          Compare
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {[
            { label: "30D", days: 30 },
            { label: "90D", days: 90 },
            { label: "6M", days: 180 },
            { label: "1Y", days: 365 },
            { label: "All", days: null },
          ].map(qr => (
            <button
              key={qr.label}
              onClick={() => {
                if (qr.days === null) {
                  onDateFromChange("2024-07-01");
                  onDateToChange(today);
                } else {
                  const d = new Date();
                  d.setDate(d.getDate() - qr.days);
                  onDateFromChange(d.toISOString().slice(0, 10));
                  onDateToChange(today);
                }
              }}
              className="px-2 py-1 text-[10px] font-body text-slate-500 hover:text-teal-600 transition-colors"
            >
              {qr.label}
            </button>
          ))}
        </div>
      </div>
      {comparison && (
        <p className="text-[11px] text-teal-600 mt-2">
          Comparing selected period vs previous equivalent period — dashed lines show previous period.
        </p>
      )}
    </div>
  );
}