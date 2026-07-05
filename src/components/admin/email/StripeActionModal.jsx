import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2, CreditCard, Ban, CheckCircle2, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function StripeActionModal({ contact, action, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [refundAmount, setRefundAmount] = useState(null);

  useEffect(() => { fetchDetails(); }, []);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("manageStripeSubscription", {
        action: "get_details",
        customer_email: contact.email,
      });
      const data = res.data;
      if (data.error) throw new Error(data.error);
      setDetails(data);
      if (action === "refund" && data.charges?.length > 0) {
        const refundable = data.charges.find(c => !c.refunded) || data.charges[0];
        setSelectedCharge(refundable);
        setRefundAmount(refundable.amount);
      }
    } catch (e) {
      setError(e.message || e?.response?.data?.error || "Failed to load Stripe details");
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      if (action === "cancel") {
        const activeSub = details.subscriptions?.find(s => s.status === "active");
        if (!activeSub) throw new Error("No active subscription found");
        const res = await base44.functions.invoke("manageStripeSubscription", {
          action: "cancel_subscription",
          subscription_id: activeSub.id,
        });
        if (res.data.error) throw new Error(res.data.error);
        setResult(res.data);
      } else if (action === "refund") {
        if (!selectedCharge) throw new Error("No payment selected");
        const isPartial = refundAmount < selectedCharge.amount;
        const res = await base44.functions.invoke("manageStripeSubscription", {
          action: "refund_payment",
          payment_intent_id: selectedCharge.payment_intent_id,
          charge_id: selectedCharge.id,
          amount: isPartial ? refundAmount : undefined,
        });
        if (res.data.error) throw new Error(res.data.error);
        setResult(res.data);
      }
    } catch (e) {
      setError(e.message || e?.response?.data?.error || "Action failed");
    }
    setConfirming(false);
  };

  const isCancel = action === "cancel";
  const TitleIcon = isCancel ? Ban : RotateCcw;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCancel ? "bg-red-50" : "bg-amber-50"}`}>
              <TitleIcon className={`w-4 h-4 ${isCancel ? "text-red-500" : "text-amber-600"}`} />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-900 uppercase tracking-tight">
                {isCancel ? "Cancel Subscription" : "Refund Payment"}
              </h3>
              <p className="text-[10px] text-slate-400">{contact.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
              <p className="text-sm text-slate-500">Loading Stripe details…</p>
            </div>
          )}

          {error && !loading && !result && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {details && !result && (
            <>
              {/* Customer info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Stripe Customer</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 text-[10px]">Name</p>
                    <p className="text-slate-900 font-body">{details.customer.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Email</p>
                    <p className="text-slate-900 font-body truncate">{details.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Customer ID</p>
                    <p className="text-slate-500 font-mono text-[10px] truncate">{details.customer.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Created</p>
                    <p className="text-slate-500 font-body">{formatDate(details.customer.created)}</p>
                  </div>
                </div>
              </div>

              {/* Cancel: show subscriptions */}
              {isCancel && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Subscriptions</p>
                  {details.subscriptions.length === 0 ? (
                    <p className="text-xs text-slate-500">No subscriptions found</p>
                  ) : (
                    <div className="space-y-2">
                      {details.subscriptions.map(sub => (
                        <div key={sub.id} className="bg-white border border-slate-200 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-body font-semibold text-slate-900 truncate">{sub.plan}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${sub.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                            <span>${sub.amount.toFixed(2)} / {sub.interval}</span>
                            <span>Since: {formatDate(sub.created)}</span>
                            {sub.current_period_end && (
                              <span>Renews: {formatDate(sub.current_period_end)}</span>
                            )}
                            {sub.canceled_at && (
                              <span className="text-red-500">Canceled: {formatDate(sub.canceled_at)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Refund: show charges */}
              {!isCancel && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Payment History</p>
                  {details.charges.length === 0 ? (
                    <p className="text-xs text-slate-500">No payments found</p>
                  ) : (
                    <div className="space-y-2">
                      {details.charges.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => { if (!ch.refunded) { setSelectedCharge(ch); setRefundAmount(ch.amount); } }}
                          disabled={ch.refunded}
                          className={`w-full text-left bg-white border rounded-lg p-2.5 transition-colors ${selectedCharge?.id === ch.id ? "border-amber-400 ring-1 ring-amber-500/20" : "border-slate-200 hover:border-slate-300"} ${ch.refunded ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-body font-semibold text-slate-900">${ch.amount.toFixed(2)} {ch.currency}</span>
                            {ch.refunded ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600">Refunded</span>
                            ) : ch.amount_refunded > 0 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Partial (${ch.amount_refunded.toFixed(2)})</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Paid</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{formatDate(ch.created)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedCharge && !selectedCharge.refunded && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <label className="text-[10px] text-slate-400 block mb-1">Refund amount (max ${selectedCharge.amount.toFixed(2)})</label>
                      <input
                        type="number"
                        step="0.01"
                        max={selectedCharge.amount}
                        value={refundAmount}
                        onChange={e => setRefundAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-body focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Full amount = complete refund · Lower amount = partial refund</p>
                    </div>
                  )}
                </div>
              )}

              {/* Warning */}
              <div className={`flex items-start gap-2 ${isCancel ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"} border rounded-lg p-3 mb-4`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCancel ? "text-red-500" : "text-amber-600"}`} />
                <p className={`text-xs ${isCancel ? "text-red-600" : "text-amber-700"} font-body`}>
                  {isCancel
                    ? "This will immediately cancel the subscription in Stripe. The member will lose access at the end of the current billing period. This action cannot be undone."
                    : "This will refund the selected payment in Stripe. The money will be returned to the customer's card. This action cannot be undone."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 text-xs font-body px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming || (isCancel && !details.subscriptions?.some(s => s.status === "active")) || (!isCancel && !selectedCharge)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-body font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isCancel ? "bg-red-500 text-white hover:bg-red-600" : "bg-amber-500 text-white hover:bg-amber-600"}`}
                >
                  {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isCancel ? <Ban className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  {confirming ? "Processing…" : `Confirm ${isCancel ? "Cancellation" : "Refund"}`}
                </button>
              </div>
            </>
          )}

          {/* Success result */}
          {result && (
            <div className="text-center py-6">
              <div className={`w-12 h-12 rounded-full ${isCancel ? "bg-red-50" : "bg-amber-50"} flex items-center justify-center mx-auto mb-3`}>
                <CheckCircle2 className={`w-6 h-6 ${isCancel ? "text-red-500" : "text-amber-600"}`} />
              </div>
              <p className="text-sm font-body font-semibold text-slate-900 mb-1">
                {isCancel ? "Subscription Canceled" : "Refund Processed"}
              </p>
              {isCancel ? (
                <p className="text-xs text-slate-500">Status: {result.subscription.status}</p>
              ) : (
                <p className="text-xs text-slate-500">${result.refund.amount.toFixed(2)} {result.refund.currency} · {result.refund.status}</p>
              )}
              <button
                onClick={onSuccess}
                className="mt-4 text-xs font-body px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}