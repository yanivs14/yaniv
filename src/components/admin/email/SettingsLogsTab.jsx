import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Settings, Activity, CreditCard, Shield, Bell, BellOff } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SettingsLogsTab() {
  const [priceCheck, setPriceCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkPrices = useCallback(async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke("checkStripePrices", {});
      setPriceCheck(res.data);
    } catch (e) {
      console.error("Price check failed:", e);
    }
    setChecking(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkPrices();
  }, [checkPrices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const failedPrices = priceCheck?.prices?.filter(p => p.status !== "active") || [];
  const hasFailures = failedPrices.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <h2 className="font-body text-base font-bold text-slate-900 uppercase tracking-tight">Settings & Logs</h2>
        </div>
        <button
          onClick={checkPrices}
          disabled={checking}
          className="flex items-center gap-1.5 text-xs font-body text-slate-500 hover:text-teal-600 border border-slate-200 hover:border-teal-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          Re-check
        </button>
      </div>

      {/* Alert banner if any plan is broken */}
      {hasFailures && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-body font-bold text-red-900 text-sm">
              {failedPrices.length} {failedPrices.length === 1 ? "plan is" : "plans are"} not working!
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Customers cannot purchase: {failedPrices.map(p => p.label).join(", ")}
            </p>
            <p className="text-xs text-red-600 mt-1 font-medium">
              Fix in Stripe Dashboard → Products → reactivate the price or update the Price ID in the code.
            </p>
          </div>
        </motion.div>
      )}

      {/* All clear banner */}
      {!hasFailures && priceCheck && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-body font-bold text-emerald-900 text-sm">All plans are active</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {priceCheck.active_count}/{priceCheck.total} checkout prices verified as active.
            </p>
          </div>
        </motion.div>
      )}

      {/* Price status table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-body font-semibold text-slate-900">Checkout Price Status</p>
          {priceCheck?.checked_at && (
            <span className="ml-auto text-[10px] text-slate-400 font-body">
              Last checked: {new Date(priceCheck.checked_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {priceCheck?.prices?.map((price, i) => {
            const isBroken = price.status !== "active";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 px-4 py-3 ${isBroken ? "bg-red-50/50" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isBroken ? "bg-red-100" : "bg-emerald-100"
                }`}>
                  {isBroken ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-slate-900 truncate">{price.label}</p>
                  <p className="text-[11px] text-slate-400 font-body truncate">
                    {price.source} · {price.id}
                    {price.product_name && ` · ${price.product_name}`}
                    {price.unit_amount != null && ` · $${(price.unit_amount / 100).toFixed(0)}/${price.recurring || "one-time"}`}
                  </p>
                  {isBroken && price.error && (
                    <p className="text-[11px] text-red-600 font-body mt-0.5">{price.error}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-[10px] font-body font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                    isBroken
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {price.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-body font-semibold text-slate-900">System Info</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400">Stripe Mode</p>
            <p className="text-sm font-body font-medium text-slate-700 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              Live
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Prices Monitored</p>
            <p className="text-sm font-body font-medium text-slate-700">{priceCheck?.total || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}