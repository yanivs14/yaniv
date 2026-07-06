import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Users, RefreshCw, Crown, RotateCcw, Activity, Calendar, Undo2, FileText, Clock } from "lucide-react";
import {
  fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm, mergeSkoolIntoCrm,
  fetchSkoolUploads, saveSkoolUpload, restoreSkoolUpload, activateSkoolUpload,
} from "@/lib/crmData";
import SkoolUpload from "@/components/admin/email/SkoolUpload";
import FinanceSourceBreakdown from "@/components/admin/email/FinanceSourceBreakdown";
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
  "#0d9488", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

export default function FinancesTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [skoolData, setSkoolData] = useState(null);
  const [skoolMeta, setSkoolMeta] = useState(null);
  const [skoolHistory, setSkoolHistory] = useState([]);
  const preSkoolSnapshot = useRef(null);
  const [filterYear, setFilterYear] = useState("all");
  const [fromMonth, setFromMonth] = useState("all");
  const [toMonth, setToMonth] = useState("all");
  const isFirstLoad = useRef(true);

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3].filter(y => y >= 2022);

  const dateRange = useMemo(() => {
    if (filterYear === "all") return null;
    const y = parseInt(filterYear);
    let fromM = fromMonth === "all" ? 0 : parseInt(fromMonth);
    let toM = toMonth === "all" ? 11 : parseInt(toMonth);
    if (fromM > toM) { const tmp = fromM; fromM = toM; toM = tmp; }
    const lastDay = new Date(y, toM + 1, 0).getDate();
    return {
      created_after: `${y}-${String(fromM + 1).padStart(2, "0")}-01`,
      created_before: `${y}-${String(toM + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [filterYear, fromMonth, toMonth]);

  const applySkool = useCallback((skoolResult, meta) => {
    setSkoolData(skoolResult);
    setSkoolMeta(meta);
    setData(prev => {
      if (!prev) return prev;
      preSkoolSnapshot.current = JSON.parse(JSON.stringify(prev));
      return mergeSkoolIntoCrm({ ...prev }, skoolResult, dateRange);
    });
  }, [dateRange]);

  const handleSkoolData = useCallback(async (skoolResult) => {
    const fileName = skoolResult.fileName || "skool.csv";
    try {
      const saved = await saveSkoolUpload(fileName, skoolResult);
      if (saved) {
        applySkool(skoolResult, {
          id: saved.id,
          fileName: saved.file_name,
          uploadedAt: saved.created_date,
        });
        const history = await fetchSkoolUploads();
        setSkoolHistory(history);
      }
    } catch (e) {
      console.error("Failed to save Skool upload:", e);
      applySkool(skoolResult, { fileName, uploadedAt: new Date().toISOString() });
    }
  }, [applySkool]);

  const handleRestore = useCallback(async () => {
    try {
      await restoreSkoolUpload();
    } catch (e) {
      console.error("Failed to restore in DB:", e);
    }
    if (preSkoolSnapshot.current) {
      setData(JSON.parse(JSON.stringify(preSkoolSnapshot.current)));
      preSkoolSnapshot.current = null;
    }
    setSkoolData(null);
    setSkoolMeta(null);
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

  const loadData = useCallback(async (stripeRange) => {
    setLoading(true);
    try {
      const crmData = await fetchCrmOnly();
      setData(crmData);
      setLoading(false);
      setStripeLoading(true);
      try {
        const stripeData = await fetchStripeOnly(stripeRange);
        setData(prev => prev ? mergeStripeIntoCrm({ ...prev }, stripeData) : prev);
      } catch (e) {
        console.error("Stripe enrich failed:", e);
      }
      setStripeLoading(false);
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

  useEffect(() => { loadData(null); }, [loadData]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    loadData(dateRange);
  }, [dateRange, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
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

  const isFiltered = financials.date_filtered;
  const totalTransactions = Object.values(financials.monthly_data || {}).reduce((sum, m) => sum + (m.transactions || 0), 0);
  const netRevenue = (financials.total_revenue || 0) - (financials.total_refunded || 0);

  const mainCards = isFiltered ? [
    { label: "Revenue in Range", value: formatMoney(financials.total_revenue), sub: `${totalTransactions} transactions`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "MRR", value: formatMoney(financials.mrr), sub: "Current recurring", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Avg Revenue / Customer", value: formatMoney(financials.arpu), sub: `${stats.paying_customers || 0} in range`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Net Revenue", value: formatMoney(netRevenue), sub: "After refunds", icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Refunded", value: formatMoney(financials.total_refunded), sub: `${stats.refunded || 0} customers`, icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
    { label: "Transactions", value: totalTransactions, sub: "In selected range", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  ] : [
    { label: "Revenue This Month", value: formatMoney(financials.this_month_revenue), sub: `${financials.this_month_transactions || 0} transactions`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", change: revenueChange },
    { label: "Last Month", value: formatMoney(financials.last_month_revenue), sub: `${financials.last_month_transactions || 0} transactions`, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "MRR", value: formatMoney(financials.mrr), sub: "Monthly recurring", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Avg Revenue / Customer", value: formatMoney(financials.arpu), sub: `${stats.paying_customers || 0} customers`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Revenue", value: formatMoney(financials.total_revenue), sub: "All time", icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Refunded", value: formatMoney(financials.total_refunded), sub: `${stats.refunded || 0} customers`, icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-body text-base font-bold text-slate-900 uppercase tracking-tight">Financial Overview</h2>
        <span className="flex items-center gap-2">
          {stripeLoading && (
            <span className="flex items-center gap-1 text-[10px] text-teal-600">
              <div className="w-3 h-3 border border-teal-600 border-t-transparent rounded-full animate-spin" />
              Loading Stripe…
            </span>
          )}
          <button onClick={loadData} className="text-slate-400 hover:text-teal-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </span>
      </div>

      {/* Skool integration bar */}
      {skoolMeta ? (
        <div className="space-y-2 mb-4">
          <div className="bg-white border border-amber-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-semibold text-slate-900 truncate">{skoolMeta.fileName}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Uploaded {new Date(skoolMeta.uploadedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                <span className="text-amber-600 ml-1">· Active</span>
              </p>
            </div>
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 text-xs font-body text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-300 rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Restore
            </button>
          </div>
          {skoolHistory.filter(u => !u.is_active).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide px-1 pb-1.5">Previous uploads</p>
              <div className="space-y-1">
                {skoolHistory.filter(u => !u.is_active).map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleActivate(u.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-600 truncate flex-1">{u.file_name}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(u.created_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                    <RotateCcw className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
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
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide px-1 pb-1.5">Previous uploads</p>
              <div className="space-y-1">
                {skoolHistory.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleActivate(u.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-600 truncate flex-1">{u.file_name}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(u.created_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </span>
                    <RotateCcw className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date range filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-400 font-body font-medium uppercase tracking-wide">Range</span>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-body text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {filterYear !== "all" && (
            <>
              <select
                value={fromMonth}
                onChange={e => setFromMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-body text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                <option value="all">From: Any</option>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <span className="text-slate-300 text-xs">→</span>
              <select
                value={toMonth}
                onChange={e => setToMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-body text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                <option value="all">To: Any</option>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <button
                onClick={() => { setFilterYear("all"); setFromMonth("all"); setToMonth("all"); }}
                className="text-xs text-teal-600 hover:underline font-body ml-auto"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
        {mainCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xs text-slate-500 font-body">{s.label}</p>
                {s.change !== undefined && s.change !== 0 && (
                  <span className={`ml-auto text-xs font-bold flex items-center gap-0.5 ${s.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {s.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(s.change).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="font-body text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue by source + additional metrics */}
      <FinanceSourceBreakdown data={data} />

      {/* Revenue chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-body font-semibold text-slate-900 mb-3">{isFiltered ? "Revenue — Selected Range" : "Revenue — Last 6 Months"}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                cursor={{ fill: "rgba(13,148,136,0.05)" }}
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }}
                labelStyle={{ color: "#475569" }}
                formatter={(value, name) => [name === "revenue" ? formatMoneyDetailed(value) : value, name === "revenue" ? "Revenue" : "Transactions"]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {monthlyData.map((_, idx) => (
                  <Cell key={idx} fill={idx === monthlyData.length - 1 ? "#0d9488" : "#99f6e4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Plan breakdown */}
      {planBreakdown.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-body font-semibold text-slate-900 mb-3">Customers by Plan</p>
          <div className="space-y-2.5">
            {planBreakdown.map(([plan, count], idx) => {
              const maxCount = planBreakdown[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 font-body truncate pr-2">{plan}</span>
                    <span className="text-sm font-bold text-slate-900 flex-shrink-0">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-body font-semibold text-slate-900 mb-3">Key Metrics</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-slate-400">Churn Rate</p>
            <p className="text-lg font-bold text-red-500">{(financials.churn_rate || 0).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Paying Customers</p>
            <p className="text-lg font-bold text-emerald-600">{stats.paying_customers || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Churned</p>
            <p className="text-lg font-bold text-red-500">{stats.churned || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Net Revenue</p>
            <p className="text-lg font-bold text-teal-600">{formatMoney((financials.total_revenue || 0) - (financials.total_refunded || 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}