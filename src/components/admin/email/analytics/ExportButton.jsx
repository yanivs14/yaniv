import React, { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { exportCSV, exportXLSX, aggregateByInterval } from "@/lib/exportUtils";

const INTERVALS = [
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "annual", label: "Annual" },
];

export default function ExportButton({ data, filename, label = "Export" }) {
  const [open, setOpen] = useState(false);

  const handleExport = (format, interval) => {
    const aggregated = aggregateByInterval(data, interval);
    const fname = `${filename}_${interval}`;
    if (format === 'csv') exportCSV(aggregated, fname);
    else exportXLSX(aggregated, fname, label);
    setOpen(false);
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-body text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> {label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-[180px]">
            {INTERVALS.map(interval => (
              <div key={interval.key} className="mb-1.5 last:mb-0">
                <p className="text-[10px] uppercase text-slate-400 px-2 py-0.5">{interval.label}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExport('csv', interval.key)}
                    className="flex-1 text-xs text-slate-600 hover:bg-slate-100 rounded px-2 py-1 text-left"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('xlsx', interval.key)}
                    className="flex-1 text-xs text-slate-600 hover:bg-slate-100 rounded px-2 py-1 text-left"
                  >
                    XLSX
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}