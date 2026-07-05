import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw, Zap, Webhook, Clock, Mail, Users, CreditCard, Calendar,
  CheckCircle, XCircle, Activity, Database, Cloud, ChevronDown, ChevronUp,
  Receipt, RotateCcw, FileText, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import SettingToggle from "@/components/admin/email/SettingToggle";

const AUTOMATIONS = [
  {
    name: "Stripe Webhook",
    icon: CreditCard,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    type: "Webhook",
    description: "Listens for Stripe checkout completions, subscription cancellations, and refunds. Syncs customer status to Kit, HubSpot, GA4, and Skool automatically.",
    trigger: "Stripe events → /stripeWebhook",
    function: "stripeWebhook",
  },
  {
    name: "Calendly Sync",
    icon: Calendar,
    color: "text-teal-600",
    bg: "bg-teal-50",
    type: "Scheduled",
    description: "Polls Calendly every 2 hours for new bookings and cancellations. Updates CRM leads with meeting status and sends admin email notifications.",
    trigger: "Every 2 hours",
    function: "syncCalendlyMeetings",
  },
  {
    name: "HubSpot Sync",
    icon: Cloud,
    color: "text-orange-600",
    bg: "bg-orange-50",
    type: "Entity Trigger",
    description: "Automatically syncs every new lead to HubSpot CRM when a Lead record is created in the database.",
    trigger: "On Lead create",
    function: "syncLeadToHubspot",
  },
  {
    name: "Kit (ConvertKit) Sync",
    icon: Mail,
    color: "text-amber-600",
    bg: "bg-amber-50",
    type: "On-Demand",
    description: "Syncs new leads to Kit (ConvertKit) for email marketing. Tags subscribers based on quiz results and purchase behavior.",
    trigger: "On lead submit",
    function: "syncLeadToKit",
  },
  {
    name: "Skool Integration",
    icon: Database,
    color: "text-purple-600",
    bg: "bg-purple-50",
    type: "CSV Upload",
    description: "Manual CSV upload from Skool merges member data, revenue, and churn status into the CRM dashboard.",
    trigger: "Manual upload",
    function: "parseSkoolFile",
  },
  {
    name: "Auto Lead Email",
    icon: Zap,
    color: "text-teal-600",
    bg: "bg-teal-50",
    type: "On-Demand",
    description: "Sends automatic confirmation email to new leads upon form submission. Toggle below to enable/disable.",
    trigger: "On lead submit",
    function: "submitLead",
  },
];

function formatTime(dateStr) {
  if (!dateStr) return "—";
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) normalized = normalized + "Z";
  const d = new Date(normalized);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function formatStripeTime(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

const STRIPE_EVENT_LABELS = {
  "checkout.session.completed": "Checkout Completed",
  "customer.subscription.created": "Subscription Created",
  "customer.subscription.updated": "Subscription Updated",
  "customer.subscription.deleted": "Subscription Cancelled",
  "charge.refunded": "Refund Processed",
  "invoice.paid": "Invoice Paid",
  "invoice.payment_failed": "Payment Failed",
  "payment_intent.succeeded": "Payment Succeeded",
};

export default function AutomationsTab({ leadSettings, onToggleAutoEmail, onToggleReceiptEmails, onToggleRefundEmails, onToggleSkoolWelcome }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("getAutomationsData", {});
      setData(res.data);
    } catch (e) {
      console.error("Failed to load automations data:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const calendlyLogs = data?.calendly_tracking || [];
  const skoolUploads = data?.skool_uploads || [];
  const emailLogs = data?.email_logs || [];
  const stripeEvents = data?.stripe_events || [];
  const receiptRefundLogs = emailLogs.filter(l => l.template_name === "receipt" || l.template_name === "refund" || l.template_name === "welcome_skool");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-body text-base font-bold text-slate-900">Automations & Integrations</h2>
        <button onClick={loadData} className="text-slate-400 hover:text-teal-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Automation cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AUTOMATIONS.map((auto, i) => {
              const Icon = auto.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${auto.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${auto.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-body font-bold text-slate-900">{auto.name}</p>
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full border ${auto.bg} ${auto.color} border-current/20`}>
                          {auto.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{auto.description}</p>
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Activity className="w-3 h-3" /> {auto.trigger}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">→ {auto.function}()</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Settings Toggles */}
          <div className="space-y-2.5">
            <SettingToggle
              title="Auto Lead Email"
              description="Confirmation email to new leads"
              enabled={leadSettings?.auto_email_enabled !== false}
              onToggle={onToggleAutoEmail}
              icon={Zap}
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
            />
            <SettingToggle
              title="Payment Receipt Emails"
              description="Sent to customers after checkout"
              enabled={leadSettings?.receipt_emails_enabled !== false}
              onToggle={onToggleReceiptEmails}
              icon={Receipt}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
            />
            <SettingToggle
              title="Refund Notification Emails"
              description="Sent to customers on refund"
              enabled={leadSettings?.refund_emails_enabled !== false}
              onToggle={onToggleRefundEmails}
              icon={RotateCcw}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
            <SettingToggle
              title="Welcome + Join Skool Email"
              description="Sent to customers after purchase with Skool registration link"
              enabled={leadSettings?.skool_welcome_email_enabled !== false}
              onToggle={onToggleSkoolWelcome}
              icon={Sparkles}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
            />
          </div>

          {/* Logs sections */}
          <div className="space-y-3">
            {/* Stripe Events */}
            <LogSection
              title="Stripe Webhook Events"
              icon={CreditCard}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
              count={stripeEvents.length}
              expanded={expandedSection === "stripe"}
              onToggle={() => setExpandedSection(expandedSection === "stripe" ? null : "stripe")}
            >
              {stripeEvents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent Stripe events</p>
              ) : (
                <div className="space-y-1.5">
                  {stripeEvents.map((ev, i) => (
                    <div key={ev.id || i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.livemode ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span className="text-xs font-body text-slate-900 flex-1 truncate">
                        {STRIPE_EVENT_LABELS[ev.type] || ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatStripeTime(ev.created)}</span>
                    </div>
                  ))}
                </div>
              )}
            </LogSection>

            {/* Calendly Tracking */}
            <LogSection
              title="Calendly Meeting Logs"
              icon={Calendar}
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
              count={calendlyLogs.length}
              expanded={expandedSection === "calendly"}
              onToggle={() => setExpandedSection(expandedSection === "calendly" ? null : "calendly")}
            >
              {calendlyLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No Calendly tracking records</p>
              ) : (
                <div className="space-y-1.5">
                  {calendlyLogs.map((log, i) => (
                    <div key={log.id || i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "booked" ? "bg-emerald-500" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body text-slate-900 truncate">
                          {log.invitee_name || log.invitee_email || "Unknown"}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{log.event_name}</p>
                      </div>
                      <span className={`text-[10px] font-body px-2 py-0.5 rounded-full flex-shrink-0 ${log.status === "booked" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(log.created_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </LogSection>

            {/* Email Logs */}
            <LogSection
              title="Email Send Logs"
              icon={Mail}
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
              count={emailLogs.length}
              expanded={expandedSection === "emails"}
              onToggle={() => setExpandedSection(expandedSection === "emails" ? null : "emails")}
            >
              {emailLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No email logs</p>
              ) : (
                <div className="space-y-1.5">
                  {emailLogs.map((log, i) => (
                    <div key={log.id || i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "sent" ? "bg-emerald-500" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body text-slate-900 truncate">
                          {log.recipient_name || log.recipient_email}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{log.subject || "—"}</p>
                      </div>
                      <span className={`text-[10px] font-body px-2 py-0.5 rounded-full flex-shrink-0 ${log.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(log.created_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </LogSection>

            {/* Receipt & Refund Emails */}
            <LogSection
              title="Transaction & Welcome Emails"
              icon={FileText}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
              count={receiptRefundLogs.length}
              expanded={expandedSection === "receipts"}
              onToggle={() => setExpandedSection(expandedSection === "receipts" ? null : "receipts")}
            >
              {receiptRefundLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No transactional emails sent yet</p>
              ) : (
                <div className="space-y-1.5">
                  {receiptRefundLogs.map((log, i) => {
                    const isRefund = log.template_name === "refund";
                    const isWelcome = log.template_name === "welcome_skool";
                    const badgeLabel = isRefund ? "Refund" : isWelcome ? "Welcome" : "Receipt";
                    const badgeClass = isRefund ? "bg-amber-100 text-amber-700" : isWelcome ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700";
                    const logIcon = isRefund ? <RotateCcw className="w-3 h-3 text-amber-500 flex-shrink-0" /> : isWelcome ? <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" /> : <Receipt className="w-3 h-3 text-indigo-500 flex-shrink-0" />;
                    return (
                      <div key={log.id || i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "sent" ? "bg-emerald-500" : "bg-red-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-body text-slate-900 truncate flex items-center gap-1.5">
                            {logIcon}
                            {log.recipient_name || log.recipient_email}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{log.subject || "—"}</p>
                        </div>
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                        <span className={`text-[10px] font-body px-2 py-0.5 rounded-full flex-shrink-0 ${log.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(log.created_date)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </LogSection>

            {/* Skool Uploads */}
            <LogSection
              title="Skool Upload History"
              icon={Database}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              count={skoolUploads.length}
              expanded={expandedSection === "skool"}
              onToggle={() => setExpandedSection(expandedSection === "skool" ? null : "skool")}
            >
              {skoolUploads.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No Skool uploads</p>
              ) : (
                <div className="space-y-1.5">
                  {skoolUploads.map((upload, i) => (
                    <div key={upload.id || i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${upload.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body text-slate-900 truncate">{upload.file_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {upload.data?.stats?.total_members || 0} members · ${upload.data?.financials?.total_revenue?.toLocaleString() || 0}
                        </p>
                      </div>
                      {upload.is_active && (
                        <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                          Active
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(upload.created_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </LogSection>
          </div>
        </>
      )}
    </div>
  );
}

function LogSection({ title, icon: Icon, iconColor, iconBg, count, expanded, onToggle, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-sm font-body font-semibold text-slate-900 flex-1 text-left">{title}</p>
        <span className="text-xs text-slate-400 font-body bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-slate-100 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}