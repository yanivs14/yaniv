import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { PRODUCT_LABELS } from "@/lib/trendUtils";

const RANK = { monthly: 1, annual: 2, inner_circle: 3, handstand: 1, one_time: 0, other: 0 };

function isUpgrade(from, to) {
  return (RANK[to] || 0) > (RANK[from] || 0);
}

export default function PlanTransfers({ transfers }) {
  const stats = useMemo(() => {
    if (!transfers || transfers.length === 0) return { total: 0, upgrades: 0, downgrades: 0, byType: {}, recent: [] };
    const upgrades = transfers.filter(t => isUpgrade(t.from, t.to)).length;
    const downgrades = transfers.length - upgrades;
    const byType = {};
    for (const t of transfers) {
      const key = `${t.from}→${t.to}`;
      byType[key] = (byType[key] || 0) + 1;
    }
    const recent = [...transfers].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    return { total: transfers.length, upgrades, downgrades, byType, recent };
  }, [transfers]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-purple-500 rounded-full" />
        <p className="text-sm font-body font-bold text-slate-900">Plan Transfers (Upgrades / Downgrades)</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-2xl font-bold font-body text-slate-900">{stats.total}</p>
          <p className="text-[10px] text-slate-400">Total Transfers</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-2 text-center">
          <p className="text-2xl font-bold font-body text-emerald-600">{stats.upgrades}</p>
          <p className="text-[10px] text-slate-400">Upgrades ↑</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <p className="text-2xl font-bold font-body text-red-500">{stats.downgrades}</p>
          <p className="text-[10px] text-slate-400">Downgrades ↓</p>
        </div>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([key, count]) => {
          const [from, to] = key.split("→");
          const up = isUpgrade(from, to);
          return (
            <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">{PRODUCT_LABELS[from] || from}</span>
                <ArrowRight className={`w-3 h-3 ${up ? "text-emerald-500" : "text-red-400"}`} />
                <span className="font-medium text-slate-700">{PRODUCT_LABELS[to] || to}</span>
              </div>
              <span className="font-bold text-slate-900">{count}x</span>
            </div>
          );
        })}
        {stats.total === 0 && <p className="text-xs text-slate-400 text-center py-4">No plan transfers detected</p>}
      </div>
    </div>
  );
}