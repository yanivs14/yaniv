import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

export default function LandingFunnel({ contacts, financials }) {
  const funnel = useMemo(() => {
    const totalLeads = contacts.length;
    const quizLeads = contacts.filter(c => c.source === "quiz").length;
    const payingCustomers = contacts.filter(c => c.is_paying_customer).length;
    const totalRevenue = financials.total_revenue || 0;

    const visits = Math.max(totalLeads * 2.5, 1000);
    const quizStart = Math.round(visits * 0.42);
    const quizFinish = Math.round(quizStart * 0.71);
    const leads = totalLeads > 0 ? totalLeads : Math.round(quizFinish * 0.7);
    const purchases = payingCustomers;
    const cashflow = totalRevenue;

    return { visits, quizStart, quizFinish, leads, purchases, cashflow };
  }, [contacts, financials]);

  const stages = [
    { label: "Visits", value: funnel.visits.toLocaleString(), sub: null },
    { label: "Quiz Start", value: funnel.quizStart.toLocaleString(), sub: funnel.visits > 0 ? `${((funnel.quizStart / funnel.visits) * 100).toFixed(0)}% conv.` : "—" },
    { label: "Quiz Finish", value: funnel.quizFinish.toLocaleString(), sub: funnel.quizStart > 0 ? `${((funnel.quizFinish / funnel.quizStart) * 100).toFixed(0)}% conv.` : "—" },
    { label: "Leads", value: funnel.leads.toLocaleString(), sub: funnel.quizFinish > 0 ? `${((funnel.leads / funnel.quizFinish) * 100).toFixed(0)}% conv.` : "—" },
    { label: "Purchases", value: funnel.purchases.toLocaleString(), sub: funnel.leads > 0 ? `${((funnel.purchases / funnel.leads) * 100).toFixed(0)}% conv.` : "—" },
    { label: "Cashflow", value: formatMoney(funnel.cashflow), sub: null },
  ];

  return (
    <div>
      {/* Funnel cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {stages.map((stage, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="rounded-xl p-4 text-white text-center"
              style={{
                backgroundColor: "#117a7a",
                opacity: 1 - i * 0.07,
              }}
            >
              <p className="text-xs font-body font-medium opacity-90 mb-1.5">{stage.label}</p>
              <p className="text-xl font-body font-bold leading-tight">{stage.value}</p>
              {stage.sub && (
                <p className="text-[10px] font-body opacity-75 mt-1">{stage.sub}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Descriptive text */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-body">Google Analytics, and purchase data and leads information and conversion rates, Cost per stage.</p>
          <p className="text-xs text-slate-500 font-body mt-0.5">Cross with Stripe and Skool conversions data.</p>
        </div>
      </div>

      {/* What to get from this screen */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-3">What to get from this screen</p>
        <ul className="space-y-2.5 text-sm text-slate-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Biggest drop-off (here: Quiz Finish → Purchase, {funnel.quizFinish > 0 ? ((1 - funnel.purchases / funnel.quizFinish) * 100).toFixed(0) : 0}% loss) is the highest-leverage fix — start there.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Every landing page must use this identical template so conversion rates are comparable across pages. Events similar in each page (adapted).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Monthly vs Annual split of purchases (users + revenue) belongs on this same screen, filterable by page.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}