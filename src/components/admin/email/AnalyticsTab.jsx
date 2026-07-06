import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Percent, TrendingUp, PieChart, Filter, MapPin, Flag, ArrowLeft, RefreshCw } from "lucide-react";
import { fetchCrmOnly, fetchStripeOnly, mergeStripeIntoCrm, fetchSkoolUploads, mergeSkoolIntoCrm } from "@/lib/crmData";
import ExecutiveOverview from "@/components/admin/email/analytics/ExecutiveOverview";
import UnitEconomics from "@/components/admin/email/analytics/UnitEconomics";
import TrendOverTime from "@/components/admin/email/analytics/TrendOverTime";
import SubscriptionPricing from "@/components/admin/email/analytics/SubscriptionPricing";
import LandingFunnel from "@/components/admin/email/analytics/LandingFunnel";
import TrafficChannels from "@/components/admin/email/analytics/TrafficChannels";
import CreativeLeaderboard from "@/components/admin/email/analytics/CreativeLeaderboard";

const CARDS = [
  { key: "executive", title: "Executive Overview", subtitle: "Today's snapshot — leadership", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
  { key: "unit_economics", title: "Unit Economics", subtitle: "CAC · LTV · churn health", icon: Percent, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "trends", title: "Trend Over Time", subtitle: "Jul '24 → today, monthly", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "subscriptions", title: "Subscription & Pricing", subtitle: "Monthly / Annual / Untagged", icon: PieChart, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "funnel", title: "Landing Page Funnel", subtitle: "Visit → Quiz → Lead → Purchase", icon: Filter, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "traffic", title: "Traffic Channels", subtitle: "Per-channel ROI", icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "creative", title: "Creative Leaderboard", subtitle: "What messaging wins", icon: Flag, color: "text-rose-600", bg: "bg-rose-50" },
];

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setSelectedCard(null);
    try {
      const crmData = await fetchCrmOnly();
      let merged = crmData;
      try {
        const uploads = await fetchSkoolUploads();
        const active = uploads.find(u => u.is_active);
        if (active?.data) {
          merged = mergeSkoolIntoCrm({ ...merged }, active.data, null);
        }
      } catch {}
      setData(merged);
      setLoading(false);
      setStripeLoading(true);
      try {
        const stripeData = await fetchStripeOnly();
        setData(prev => prev ? mergeStripeIntoCrm({ ...prev }, stripeData) : prev);
      } catch (e) {
        console.error("Stripe enrich failed:", e);
      }
      setStripeLoading(false);
    } catch (e) {
      console.error("Analytics load failed:", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const contacts = data?.contacts || [];
  const financials = data?.financials || {};
  const stats = data?.stats || {};

  if (selectedCard) {
    const card = CARDS.find(c => c.key === selectedCard);
    return (
      <div>
        <button onClick={() => setSelectedCard(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Analytics
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-full ${card.bg} flex items-center justify-center`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <h2 className="font-body text-lg font-bold text-slate-900">{card.title}</h2>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={selectedCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {selectedCard === "executive" && <ExecutiveOverview contacts={contacts} financials={financials} stats={stats} />}
            {selectedCard === "unit_economics" && <UnitEconomics contacts={contacts} financials={financials} stats={stats} />}
            {selectedCard === "trends" && <TrendOverTime contacts={contacts} financials={financials} stats={stats} />}
            {selectedCard === "subscriptions" && <SubscriptionPricing contacts={contacts} financials={financials} stats={stats} />}
            {selectedCard === "funnel" && <LandingFunnel contacts={contacts} financials={financials} stats={stats} />}
            {selectedCard === "traffic" && <TrafficChannels contacts={contacts} financials={financials} stats={stats} />}
            {selectedCard === "creative" && <CreativeLeaderboard contacts={contacts} financials={financials} stats={stats} />}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-body text-base font-bold text-slate-900 uppercase tracking-tight">Analytics</h2>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button key={card.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} onClick={() => setSelectedCard(card.key)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all text-left">
              <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="font-body text-sm font-bold text-slate-900 mb-1">{card.title}</p>
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}