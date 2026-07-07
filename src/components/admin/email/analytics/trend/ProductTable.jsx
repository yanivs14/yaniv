import React, { useMemo } from "react";
import { PRODUCT_LABELS, PRODUCT_COLORS } from "@/lib/trendUtils";
import { formatMoney } from "@/components/admin/email/analytics/helpers";

export default function ProductTable({ productMonthly, dateFrom, dateTo }) {
  const data = useMemo(() => {
    if (!productMonthly) return [];
    const startMonth = dateFrom.slice(0, 7);
    const endMonth = dateTo.slice(0, 7);
    return Object.entries(productMonthly)
      .map(([cat, months]) => {
        const filtered = Object.entries(months).filter(([mk]) => mk >= startMonth && mk <= endMonth);
        const totalGross = filtered.reduce((s, [, m]) => s + m.gross, 0);
        const totalNet = filtered.reduce((s, [, m]) => s + m.net, 0);
        const totalRefunds = filtered.reduce((s, [, m]) => s + m.refunds, 0);
        const totalTxns = filtered.reduce((s, [, m]) => s + m.transactions, 0);
        return { cat, label: PRODUCT_LABELS[cat] || cat, color: PRODUCT_COLORS[cat] || "#94a3b8", totalGross, totalNet, totalRefunds, totalTxns };
      })
      .sort((a, b) => b.totalNet - a.totalNet);
  }, [productMonthly, dateFrom, dateTo]);

  const grandTotal = data.reduce((s, d) => ({ gross: s.gross + d.totalGross, net: s.net + d.totalNet, refunds: s.refunds + d.totalRefunds, txns: s.txns + d.totalTxns }), { gross: 0, net: 0, refunds: 0, txns: 0 });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-body font-semibold text-slate-900">Revenue by Product</p>
        <p className="text-[11px] text-slate-400">Gross, net, refunds & transactions per product category</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Product", "Gross", "Net", "Refunds", "Transactions", "Avg / Txn"].map((h, i) => (
                <th key={h} className={`px-4 py-2 text-xs font-body font-medium text-slate-400 uppercase ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.cat} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-2 font-body text-slate-700">
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: d.color }} />
                  {d.label}
                </td>
                <td className="px-4 py-2 text-right font-body text-slate-900">{formatMoney(d.totalGross)}</td>
                <td className="px-4 py-2 text-right font-body font-medium text-slate-900">{formatMoney(d.totalNet)}</td>
                <td className="px-4 py-2 text-right font-body text-red-500">{formatMoney(d.totalRefunds)}</td>
                <td className="px-4 py-2 text-right font-body text-slate-600">{d.totalTxns}</td>
                <td className="px-4 py-2 text-right font-body text-slate-500">{d.totalTxns > 0 ? formatMoney(d.totalNet / d.totalTxns, 2) : "—"}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-medium">
              <td className="px-4 py-2 font-body text-slate-900">Total</td>
              <td className="px-4 py-2 text-right font-body text-slate-900">{formatMoney(grandTotal.gross)}</td>
              <td className="px-4 py-2 text-right font-body text-slate-900">{formatMoney(grandTotal.net)}</td>
              <td className="px-4 py-2 text-right font-body text-red-500">{formatMoney(grandTotal.refunds)}</td>
              <td className="px-4 py-2 text-right font-body text-slate-900">{grandTotal.txns}</td>
              <td className="px-4 py-2 text-right font-body text-slate-500">{grandTotal.txns > 0 ? formatMoney(grandTotal.net / grandTotal.txns, 2) : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}