import React from "react";
import { Globe } from "lucide-react";

export default function ConversionByPage({ byPage }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Globe className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900 font-body">Conversion by Landing Page</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase">Page</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Sessions</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Conversions</th>
              <th className="text-right px-4 py-2 text-xs font-bold text-slate-500 uppercase">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {byPage.map(({ page, sessions, conversions }) => (
              <tr key={page} className="border-t border-slate-100">
                <td className="px-4 py-2.5 text-sm font-body text-slate-900 font-medium truncate max-w-xs">{page}</td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-700 text-right">{sessions.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-sm font-body text-slate-700 text-right">{conversions}</td>
                <td className="px-4 py-2.5 text-sm font-body text-teal-600 font-semibold text-right">
                  {sessions > 0 ? ((conversions / sessions) * 100).toFixed(2) : 0}%
                </td>
              </tr>
            ))}
            {byPage.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                  No page data in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}