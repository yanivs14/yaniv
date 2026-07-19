import React from "react";
import { MapPin } from "lucide-react";

export default function ConversionBySource({ bySource }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900 font-body">Conversion by Traffic Source</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase">Source</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Sessions</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Conversions</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Conv. Rate</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {bySource.map(({ source, sessions, conversions, revenue }) => (
              <tr key={source} className="border-t border-slate-100">
                <td className="px-4 py-2.5 text-sm font-body text-slate-900 font-medium">{source}</td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-700 text-right">{sessions.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-700 text-right">{conversions}</td>
                <td className="px-4 py-2.5 text-sm font-body text-teal-600 font-semibold text-right">
                  {sessions > 0 ? ((conversions / sessions) * 100).toFixed(2) : 0}%
                </td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-700 text-right">
                  ${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
            {bySource.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                  No traffic data in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}