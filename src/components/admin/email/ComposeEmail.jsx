import React, { useState } from "react";
import { Send, Zap, FileText, AlertCircle, CheckCircle, Loader, Mail, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BATCH_SIZE = 15;

export default function ComposeEmail({ selectedRecipients, onSent, onGoToRecipients }) {
  const [templateType, setTemplateType] = useState("promotion");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    setResults(null);
    setProgress({ sent: 0, failed: 0, current: 0, total: selectedRecipients.length, batch: 0, totalBatches: 0 });

    const batches = [];
    for (let i = 0; i < selectedRecipients.length; i += BATCH_SIZE) {
      batches.push(selectedRecipients.slice(i, i + BATCH_SIZE));
    }

    let totalSent = 0, totalFailed = 0;
    for (let i = 0; i < batches.length; i++) {
      setProgress(p => ({ ...p, batch: i + 1, totalBatches: batches.length }));
      try {
        const res = await base44.functions.invoke("sendBulkEmail", {
          recipients: batches[i].map(r => ({
            email: r.email,
            name: r.name,
            source: r.source,
            country: r.country,
            language: r.language,
          })),
          templateType,
          subject: templateType === "custom" ? subject : "",
          body: templateType === "custom" ? body : "",
          campaignName,
        });
        totalSent += res.data?.sent || 0;
        totalFailed += res.data?.failed || 0;
      } catch (err) {
        totalFailed += batches[i].length;
      }
      setProgress({ sent: totalSent, failed: totalFailed, current: totalSent + totalFailed, total: selectedRecipients.length, batch: i + 1, totalBatches: batches.length });
    }

    setSending(false);
    setResults({ sent: totalSent, failed: totalFailed, total: selectedRecipients.length });
    onSent();
  };

  if (selectedRecipients.length === 0 && !results) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-slate-400" />
        </div>
        <p className="font-body text-sm text-slate-500 mb-4">No recipients selected yet.</p>
        <button
          onClick={onGoToRecipients}
          className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium"
        >
          Go to Recipients <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (sending) {
    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
    return (
      <div className="py-12">
        <div className="flex flex-col items-center text-center">
          <Loader className="w-10 h-10 text-teal-600 animate-spin mb-6" />
          <p className="font-body text-lg font-bold text-slate-900 uppercase mb-1">Sending Emails...</p>
          <p className="text-xs text-slate-500 mb-6">
            Batch {progress.batch} of {progress.totalBatches} · {progress.current} / {progress.total} processed
          </p>
          <div className="w-full max-w-sm">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-teal-600 font-medium">{progress.sent} sent</span>
              {progress.failed > 0 && <span className="text-red-500 font-medium">{progress.failed} failed</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="py-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-7 h-7 text-teal-600" />
          </div>
          <p className="font-body text-xl font-bold text-slate-900 uppercase mb-2">Campaign Complete</p>
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="font-body text-2xl font-bold text-teal-600">{results.sent}</p>
              <p className="text-xs text-slate-500">Sent</p>
            </div>
            {results.failed > 0 && (
              <div className="text-center">
                <p className="font-body text-2xl font-bold text-red-500">{results.failed}</p>
                <p className="text-xs text-slate-500">Failed</p>
              </div>
            )}
            <div className="text-center">
              <p className="font-body text-2xl font-bold text-slate-900">{results.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          <button
            onClick={() => { setResults(null); }}
            className="mt-8 inline-flex items-center gap-2 text-sm bg-teal-600 text-white font-body font-semibold px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            Send Another Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Selected count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-600 font-body">
          <span className="text-teal-600 font-bold">{selectedRecipients.length}</span> recipient{selectedRecipients.length !== 1 ? "s" : ""} selected
        </p>
        <button
          onClick={onGoToRecipients}
          className="text-xs text-slate-500 hover:text-teal-600 transition-colors"
        >
          Edit selection
        </button>
      </div>

      {/* Template selector */}
      <p className="text-xs text-slate-600 font-body font-semibold uppercase tracking-wider mb-3">Email Template</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setTemplateType("promotion")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${templateType === "promotion" ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500/20" : "border-slate-200 bg-white hover:border-slate-300"}`}
        >
          <Zap className={`w-5 h-5 ${templateType === "promotion" ? "text-teal-600" : "text-slate-400"}`} />
          <span className={`text-xs font-body font-semibold ${templateType === "promotion" ? "text-slate-900" : "text-slate-600"}`}>Promotion Email</span>
          <span className="text-[10px] text-slate-400 text-center">Uses current promo page content</span>
        </button>
        <button
          onClick={() => setTemplateType("custom")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${templateType === "custom" ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500/20" : "border-slate-200 bg-white hover:border-slate-300"}`}
        >
          <FileText className={`w-5 h-5 ${templateType === "custom" ? "text-teal-600" : "text-slate-400"}`} />
          <span className={`text-xs font-body font-semibold ${templateType === "custom" ? "text-slate-900" : "text-slate-600"}`}>Custom Email</span>
          <span className="text-[10px] text-slate-400 text-center">Write your own subject & body</span>
        </button>
      </div>

      {/* Campaign name */}
      <div className="mb-4">
        <label className="block text-xs text-slate-600 mb-1.5 font-body">Campaign Name (optional)</label>
        <input
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          placeholder="e.g. June 2026 Promo"
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
        />
      </div>

      {/* Custom email fields */}
      {templateType === "custom" && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs text-slate-600 mb-1.5 font-body">Subject Line</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1.5 font-body">
              Email Body (HTML supported)
            </label>
            <p className="text-[10px] text-slate-400 mb-2">Use <code className="text-teal-600 bg-teal-50 px-1 py-0.5 rounded">{"{{name}}"}</code> to insert the recipient's first name.</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              placeholder="<h2>Hi {{name}},</h2><p>Here's something special for you...</p>"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm resize-y"
            />
          </div>
        </div>
      )}

      {/* Promotion info */}
      {templateType === "promotion" && (
        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-900 font-body font-semibold mb-1">Promotion Email Preview</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will send the current promotion page email — personalized with each recipient's name, including the promo video poster, pricing, and CTA button linking to <span className="text-teal-600 font-medium">/promotion</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={templateType === "custom" && (!subject.trim() || !body.trim())}
        className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-body text-sm font-bold py-3.5 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <Send className="w-4 h-4" />
        Send to {selectedRecipients.length} Recipient{selectedRecipients.length !== 1 ? "s" : ""}
      </button>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setConfirmOpen(false)}>
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-body text-sm font-bold text-slate-900">Confirm Send</p>
                <p className="text-xs text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-body mb-1">
              You're about to send the <span className="text-slate-900 font-semibold">{templateType === "promotion" ? "Promotion" : "Custom"}</span> email to:
            </p>
            <p className="font-body text-2xl font-bold text-teal-600 mb-1">{selectedRecipients.length}</p>
            <p className="text-xs text-slate-500 mb-5">recipient{selectedRecipients.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 text-xs text-slate-600 bg-slate-100 border border-slate-200 py-3 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex-1 text-xs font-bold bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}