import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, Crown, RotateCcw, Activity, Calendar, Undo2, FileText, Clock } from "lucide-react";
import {
  fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm, mergeSkoolIntoCrm,
  fetchSkoolUploads, saveSkoolUpload, restoreSkoolUpload, activateSkoolUpload,
} from "@/lib/crmData";
import SkoolUpload from "@/components/admin/email/SkoolUpload";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMoney(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMoneyDetailed(n) {
  return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y.slice(2)}`;
}

const PLAN_COLORS = [
  "#00fff7", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

export default function FinancesTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [skoolData, setSkoolData] = useState(null);
  const [skoolMeta, setSkoolMeta] = useState(null); // { id, fileName, uploadedAt }
  const [skoolHistory, setSkoolHistory] = useState([]);
  const preSkoolSnapshot = useRef(null);

  // Apply Skool merge to current data
  const applySkool = useCallback((skoolResult, meta) => {
    setSkoolData(skoolResult);
    setSkoolMeta(meta);
    setData(prev => {
      if (!prev) return prev;
      preSkoolSnapshot.current = JSON.parse(JSON.stringify(prev));
      return mergeSkoolIntoCrm({ ...prev }, skoolResult);
    });
  }, []);

  const handleSkoolData = useCallback(async (skoolResult) => {
    const fileName = skoolResult.fileName || "skool.csv";
    // Save to DB
    try {
      const saved = await saveSkoolUpload(fileName, skoolResult);
      if (saved) {
        applySkool(skoolResult, {
          id: saved.id,
          fileName: saved.file_name,
          uploadedAt: saved.created_date,
        });
        // Refresh history
        const history = await fetchSkoolUploads();
        setSkoolHistory(history);
      }
    } catch (e) {
      console.error("Failed to save Skool upload:", e);
      // Still apply locally even if DB save fails
      applySkool(skoolResult, { fileName, uploadedAt: new Date().toISOString() });
    }
  }, [applySkool]);

  const handleRestore = useCallback(async () => {
    try {
      await restoreSkoolUpload();
    } catch (e) {
      console.error("Failed to restore in DB:", e);
    }
    // Restore local snapshot
    if (preSkoolSnapshot.current) {
      setData(JSON.parse(JSON.stringify(preSkoolSnapshot.current)));
      preSkoolSnapshot.current = null;
    }
    setSkoolData(null);
    setSkoolMeta(null);
    // Refresh history (the restored upload is now inactive)
    try {
      const history = await fetchSkoolUploads();
      setSkoolHistory(history);
    } catch {}
  }, []);

  const handleActivate = useCallback(async (uploadId) => {
    try {
      const activated = await activateSkoolUpload(uploadId);
      if (activated?.data) {
        applySkool(activated.data, {
          id: activated.id,
          fileName: activated.file_name,
          uploadedAt: activated.created_date,
        });
        const history = await fetchSkoolUploads();
        setSkoolHistory(history);
      }
    } catch (e) {
      console.error("Failed to activate Skool upload:", e);
    }
  }, [applySkool]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const crmData = await fetchCrmOnly();
      setData(crmData);
      setLoading(false);
      setStripeLoading(true);
      try {
        const stripeData = await fetchStripeOnly();
        setData(prev => prev ? mergeStripeIntoCrm({ ...prev }, stripeData) : prev);
      } catch (e) {
        console.error("Stripe enrich failed:", e);
      }
      setStripeLoading(false);
      // Load Skool state from DB and re-apply if active
      try {
        const uploads = await fetchSkoolUploads();
        setSkoolHistory(uploads);
        const active = uploads.find(u => u.is_active);
        if (active?.data) {
          applySkool(active.data, {
            id: active.id,
            fileName: active.file_name,
            uploadedAt: active.created_date,
          });
        }
      } catch (e) {
        console.error("Skool load from DB failed:", e);
      }
    } catch (e) {
      console.error("Finances load failed:", e);
      setLoading(false);
    }
  }, [applySkool]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const financials = data?.financials || {};
  const stats = data?.stats || {};
  const monthlyData = Object.entries(financials.monthly_data || {}).map(([key, val]) => ({
    month: monthLabel(key),
    revenue: Math.round(val.revenue),
    transactions: val.transactions,
  }));
  const planBreakdown = Object.entries(financials.plan_breakdown || {})
    .sort((a, b) => b[1] - a[1]);

  const revenueChange = financials.last_month_revenue > 0
    ? ((financials.this_month_revenue - financials.last_month_revenue) / financials.last_month_revenue) * 100
    : 0;

  const mainCards = [
    { label: "Revenue This Month", value: formatMoney(financials.this_month_revenue), sub: `${financials.this_month_transactions || 0} transactions`, icon: DollarSign, color: "text-green-400", change: revenueChange },
    { label: "Last Month", value: formatMoney(financials.last_month_revenue), sub: `${financials.last_month_transactions || 0} transactions`, icon: Calendar, color: "text-blue-400" },
    { label: "MRR", value: formatMoney(financials.mrr), sub: "Monthly recurring", icon: Activity, color: "text-orange-red" },
    { label: "Avg Revenue / Customer", value: formatMoney(financials.arpu), sub: `${stats.paying_customers || 0} customers`, icon: TrendingUp, color: "text-purple-400" },
    { label: "Total Revenue", value: formatMoney(financials.total_revenue), sub: "All time", icon: Crown, color: "text-amber-400" },
    { label: "Total Refunded", value: formatMoney(financials.total_refunded), sub: `${stats.refunded || 0} customers`, icon: RotateCcw, color: "text-red-400" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base font-bold text-off-white uppercase tracking-tight">Financial Overview</h2>
        <span className="flex items-center gap-2">
          {stripeLoading && (
            <span className="flex items-center gap-1 text-[10px] text-orange-red">
              <div className="w-3 h-3 border border-orange-red border-t-transparent rounded-full animate-spin" />
              Loading Stripe…
            </span>
          )}
          <button onClick={loadData} className="text-white-muted hover:text-orange-red transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </span>
      </div>

      {/* Skool integration bar */}
      {skoolMeta ? (
        <div className="space-y-2 mb-4">
          <div className="bg-[#111] border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-semibold text-off-white truncate">{skoolMeta.fileName}</p>
              <p className="text-[10px] text-white-dim flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                Uploaded {new Date(skoolMeta.uploadedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                <span className="text-amber-400 ml-1">· Active</span>
              </p>
            </div>
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 text-[11px] font-body text-white-muted hover:text-red-400 border border-[#2a2a2a] hover:border-red-500/40 rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Restore
            </button>
          </div>
          {/* History of previous uploads */}
          {skoolHistory.filter(u => !u.is_active).length > 0 && (
            <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-2">
              <p className="text-[9px] text-white-dim uppercase tracking-wide px-1 pb-1.5">Previous uploads</p>
              <div className="space-y-1">
                {skoolHistory.filter(u => !u.is_active).map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleActivate(u.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left"
                  >
                    <FileText className="w-3 h-3 text-white-dim flex-shrink-0" />
                    <span className="text-[11px] text-white-muted truncate flex-1">{u.file_name}</span>
                    <span className="text-[9px] text-white-dim flex-shrink-0">
                      {new Date(u.created_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                    <RotateCcw className="w-3 h-3 text-orange-red flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          <SkoolUpload onSkoolData={handleSkoolData} />
          {skoolHistory.length > 0 && (
            <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-2">
              <p className="text-[9px] text-white-dim uppercase tracking-wide px-1 pb-1.5">Previous uploads</p>
              <div className="space-y-1">
                {skoolHistory.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleActivate(u.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left"
                  >
                    <FileText className="w-3 h-3 text-white-dim flex-shrink-0" />
                    <span className="text-[11px] text-white-muted truncate flex-1">{u.file_name}</span>
                    <span className="text-[9px] text-white-dim flex-shrink-0">
                      {new Date(u.created_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                    <RotateCcw className="w-3 h-3 text-orange-red flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main stat cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {mainCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <p className="text-[10px] text-white-muted font-body">{s.label}</p>
                {s.change !== undefined && s.change !== 0 && (
                  <span className={`ml-auto text-[10px] font-bold flex items-center gap-0.5 ${s.change > 0 ? "text-green-400" : "text-red-400"}`}>
                    {s.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(s.change).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="font-heading text-xl font-bold text-off-white leading-none">{s.value}</p>
              <p className="text-[9px] text-white-dim mt-1">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue chart */}
      {monthlyData.length > 0 && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 mb-4">
          <p className="text-xs font-body font-semibold text-off-white mb-3">Revenue — Last 6 Months</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 10 }} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} />
              <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                cursor={{ fill: "rgba(0,255,247,0.05)" }}
                contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#C8C8C8" }}
                formatter={(value, name) => [name === "revenue" ? formatMoneyDetailed(value) : value, name === "revenue" ? "Revenue" : "Transactions"]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {monthlyData.map((_, idx) => (
                  <Cell key={idx} fill={idx === monthlyData.length - 1 ? "#00fff7" : "#1a4a48"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Plan breakdown */}
      {planBreakdown.length > 0 && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 mb-4">
          <p className="text-xs font-body font-semibold text-off-white mb-3">Customers by Plan</p>
          <div className="space-y-2.5">
            {planBreakdown.map(([plan, count], idx) => {
              const maxCount = planBreakdown[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white-muted font-body truncate pr-2">{plan}</span>
                    <span className="text-[11px] font-bold text-off-white flex-shrink-0">{count}</span>
                  </div>
                  <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: PLAN_COLORS[idx % PLAN_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
        <p className="text-xs font-body font-semibold text-off-white mb-3">Key Metrics</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-white-dim">Churn Rate</p>
            <p className="text-sm font-bold text-red-400">{(financials.churn_rate || 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-white-dim">Paying Customers</p>
            <p className="text-sm font-bold text-green-400">{stats.paying_customers || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-white-dim">Churned</p>
            <p className="text-sm font-bold text-red-400">{stats.churned || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-white-dim">Net Revenue</p>
            <p className="text-sm font-bold text-orange-red">{formatMoney((financials.total_revenue || 0) - (financials.total_refunded || 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}