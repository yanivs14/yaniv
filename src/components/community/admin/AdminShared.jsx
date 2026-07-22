import React from "react";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-[#1D2120]/10 border-t-[#D4F658] rounded-full animate-spin" />
    </div>
  );
}

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-[#1D2120]/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#6B6B6B] uppercase tracking-wider font-medium">{label}</span>
        {Icon && <Icon className="w-5 h-5 text-[#6B6B6B]" />}
      </div>
      <p className="text-3xl font-bold text-[#1D2120]" style={{ fontFamily: FONT_HEADING }}>{value}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl lg:text-4xl font-bold text-[#1D2120]" style={{ fontFamily: FONT_HEADING }}>{title}</h1>
        {subtitle && <p className="text-[#6B6B6B] mt-1 text-sm lg:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-[#1D2120] uppercase tracking-wider mb-2 block">{label}</label>
      {children}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full border border-[#1D2120]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3]"
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className="w-full border border-[#1D2120]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3] resize-none"
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full border border-[#1D2120]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3]"
    >
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3">
      <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#D4F658]" : "bg-[#1D2120]/10"}`}>
        <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm font-medium text-[#1D2120]">{label}</span>
    </button>
  );
}

export function Bar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 bg-[#1D2120]/5 rounded-full overflow-hidden">
      <div className="h-full bg-[#D4F658] rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}