import React from "react";

export default function ConversionStatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-slate-900 font-body">{value}</p>
      <p className="text-xs text-slate-500 font-body uppercase tracking-wide">{label}</p>
    </div>
  );
}