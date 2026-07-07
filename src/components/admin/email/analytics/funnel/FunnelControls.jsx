import React from "react";
import { Calendar, GitCompare } from "lucide-react";
import { INTERVALS } from "@/lib/trendUtils";

const PAGE_OPTIONS = [
  { key: "all", label: "All Pages" },
  { key: "quiz", label: "Quiz" },
  { key: "inner_circle", label: "Inner Circle" },
  { key: "newsletter", label: "Newsletter" },
];

const OFFERING_OPTIONS = [
  { key: "all", label: "All Offerings" },
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Annual" },
  { key: "one_time", label: "One-Time" },
  { key: "inner_circle", label: "Inner Circle" },
  { key: "handstand", label: "Handstand" },
];

export default function FunnelControls({
  dateFrom, dateTo, interval, comparison,
  pageFilter, offeringFilter,
  onDateFromChange, onDateToChange, onIntervalChange, onComparisonChange,
  onPageChange, onOfferingChange,
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input type="date" value={dateFrom} max={dateTo} onChange={e => onDateFromChange(e.target.value)}
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-body text-slate-900 focus:outline-none focus:border-teal-500" />
          <span className="text-slate-400 text-sm">→</span>
          <input type="date" value={dateTo} min={dateFrom} max={today} onChange={e => onDateToChange(e.target.value)}
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-body text-slate-900 focus:outline-none focus:border-teal-500" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {INTERVALS.map(int => (
            <button key={int.key} onClick={() => onIntervalChange(int.key)} title={int.fullLabel}
              className={`px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors ${interval === int.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {int.label}
            </button>
          ))}
        </div>

        <button onClick={() => onComparisonChange(!comparison)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium rounded-lg border transition-colors ${comparison ? "bg-teal-50 border-teal-300 text-teal-700" : "border-slate-200 text-slate-500 hover:text-slate-700"}`}>
          <GitCompare className="w-3.5 h-3.5" /> Compare
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {[
            { label: "30D", days: 30 },
            { label: "90D", days: 90 },
            { label: "6M", days: 180 },
            { label: "1Y", days: 365 },
            { label: "All", days: null },
          ].map(qr => (
            <button key={qr.label}
              onClick={() => {
                if (qr.days === null) { onDateFromChange("2024-07-01"); onDateToChange(today); }
                else { const d = new Date(); d.setDate(d.getDate() - qr.days); onDateFromChange(d.toISOString().slice(0, 10)); onDateToChange(today); }
              }}
              className="px-2 py-1 text-[10px] font-body text-slate-500 hover:text-teal-600 transition-colors">
              {qr.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-body font-semibold">Page</span>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {PAGE_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => onPageChange(opt.key)}
                className={`px-2.5 py-1 text-[11px] font-body font-medium rounded-md transition-colors ${pageFilter === opt.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-body font-semibold">Offering</span>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {OFFERING_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => onOfferingChange(opt.key)}
                className={`px-2.5 py-1 text-[11px] font-body font-medium rounded-md transition-colors ${offeringFilter === opt.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {comparison && (
        <p className="text-[11px] text-teal-600 mt-2">
          Comparing selected period vs previous equivalent period — grey bars show previous period.
        </p>
      )}
    </div>
  );
}