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
        <Mail className="w-12 h-12 text-white-dim mx-auto mb-4" />
        <p className="font-body text-sm text-white-muted mb-4">No recipients selected yet.</p>
        <button
          onClick={onGoToRecipients}
          className="inline-flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors"
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
          <Loader className="w-10 h-10 text-orange-red animate-spin mb-6" />
          <p className="font-heading text-lg font-bold text-off-white uppercase mb-1">Sending Emails...</p>
          <p className="text-xs text-white-muted mb-6">
            Batch {progress.batch} of {progress.totalBatches} · {progress.current} / {progress.total} processed
          </p>
          <div className="w-full max-w-sm">
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-red rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-orange-red">{progress.sent} sent</span>
              {progress.failed > 0 && <span className="text-red-400">{progress.failed} failed</span>}
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
          <div className="w-14 h-14 bg-orange-red/10 border border-orange-red/30 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-7 h-7 text-orange-red" />
          </div>
          <p className="font-heading text-xl font-bold text-off-white uppercase mb-2">Campaign Complete</p>
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-orange-red">{results.sent}</p>
              <p className="text-xs text-white-muted">Sent</p>
            </div>
            {results.failed > 0 && (
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-red-400">{results.failed}</p>
                <p className="text-xs text-white-muted">Failed</p>
              </div>
            )}
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-off-white">{results.total}</p>
              <p className="text-xs text-white-muted">Total</p>
            </div>
          </div>
          <button
            onClick={() => { setResults(null); }}
            className="mt-8 inline-flex items-center gap-2 text-sm bg-orange-red text-dark-bg font-body font-semibold px-6 py-3 rounded-full hover:bg-orange-red-hover transition-colors"
          >
            Send Another Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Selected count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-white-muted font-body">
          <span className="text-orange-red font-bold">{selectedRecipients.length}</span> recipient{selectedRecipients.length !== 1 ? "s" : ""} selected
        </p>
        <button
          onClick={onGoToRecipients}
          className="text-xs text-white-muted hover:text-orange-red transition-colors"
        >
          Edit selection
        </button>
      </div>

      {/* Template selector */}
      <p className="text-xs text-white-muted font-body font-semibold uppercase tracking-wider mb-3">Email Template</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setTemplateType("promotion")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${templateType === "promotion" ? "border-orange-red bg-orange-red/5" : "border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a]"}`}
        >
          <Zap className={`w-5 h-5 ${templateType === "promotion" ? "text-orange-red" : "text-white-muted"}`} />
          <span className={`text-xs font-body font-semibold ${templateType === "promotion" ? "text-off-white" : "text-white-muted"}`}>Promotion Email</span>
          <span className="text-[10px] text-white-dim text-center">Uses current promo page content</span>
        </button>
        <button
          onClick={() => setTemplateType("custom")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${templateType === "custom" ? "border-orange-red bg-orange-red/5" : "border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a]"}`}
        >
          <FileText className={`w-5 h-5 ${templateType === "custom" ? "text-orange-red" : "text-white-muted"}`} />
          <span className={`text-xs font-body font-semibold ${templateType === "custom" ? "text-off-white" : "text-white-muted"}`}>Custom Email</span>
          <span className="text-[10px] text-white-dim text-center">Write your own subject & body</span>
        </button>
      </div>

      {/* Campaign name */}
      <div className="mb-4">
        <label className="block text-xs text-white-muted mb-1.5 font-body">Campaign Name (optional)</label>
        <input
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          placeholder="e.g. June 2026 Promo"
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
        />
      </div>

      {/* Custom email fields */}
      {templateType === "custom" && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs text-white-muted mb-1.5 font-body">Subject Line</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white-muted mb-1.5 font-body">
              Email Body (HTML supported)
            </label>
            <p className="text-[10px] text-white-dim mb-2">Use <code className="text-orange-red">{"{{name}}"}</code> to insert the recipient's first name.</p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              placeholder="<h2>Hi {{name}},</h2><p>Here's something special for you...</p>"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-3 text-sm text-off-white font-body placeholder-white-dim focus:outline-none focus:border-orange-red transition-colors resize-y"
            />
          </div>
        </div>
      )}

      {/* Promotion info */}
      {templateType === "promotion" && (
        <div className="mb-6 p-4 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d]">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-off-white font-body font-semibold mb-1">Promotion Email Preview</p>
              <p className="text-xs text-white-muted leading-relaxed">
                This will send the current promotion page email — personalized with each recipient's name, including the promo video poster, pricing, and CTA button linking to <span className="text-orange-red">/promotion</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={templateType === "custom" && (!subject.trim() || !body.trim())}
        className="w-full flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold py-3.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        Send to {selectedRecipients.length} Recipient{selectedRecipients.length !== 1 ? "s" : ""}
      </button>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setConfirmOpen(false)}>
          <div className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-red/10 border border-orange-red/30 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-orange-red" />
              </div>
              <div>
                <p className="font-body text-sm font-bold text-off-white">Confirm Send</p>
                <p className="text-xs text-white-muted">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-white-muted font-body mb-1">
              You're about to send the <span className="text-off-white font-semibold">{templateType === "promotion" ? "Promotion" : "Custom"}</span> email to:
            </p>
            <p className="font-heading text-2xl font-bold text-orange-red mb-1">{selectedRecipients.length}</p>
            <p className="text-xs text-white-muted mb-5">recipient{selectedRecipients.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 text-xs text-white-muted bg-[#1a1a1a] border border-[#2a2a2a] py-3 rounded-full hover:text-off-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex-1 text-xs font-bold bg-orange-red text-dark-bg py-3 rounded-full hover:bg-orange-red-hover transition-colors"
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