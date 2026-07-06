import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, LogOut, Users, Send, History, MailCheck, ListChecks, DollarSign, LayoutDashboard, Zap, Calendar, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import RecipientList from "@/components/admin/email/RecipientList";
import ComposeEmail from "@/components/admin/email/ComposeEmail";
import EmailHistory from "@/components/admin/email/EmailHistory";
import AutoEmailToggle from "@/components/admin/email/AutoEmailToggle";
import CrmContacts from "@/components/admin/email/CrmContacts";
import FinancesTab from "@/components/admin/email/FinancesTab";
import AutomationsTab from "@/components/admin/email/AutomationsTab";
import EmailPreviewTab from "@/components/admin/email/EmailPreviewTab";
import CalendlyTab from "@/components/admin/email/CalendlyTab";
import KitTab from "@/components/admin/email/KitTab";

const TABS = [
  { key: "crm", label: "CRM", icon: Users },
  { key: "finances", label: "Finances", icon: DollarSign },
  { key: "recipients", label: "Recipients", icon: MailCheck },
  { key: "compose", label: "Compose", icon: Send },
  { key: "history", label: "History", icon: History },
  { key: "calendly", label: "Calendly", icon: Calendar },
  { key: "kit", label: "Kit", icon: Mail },
  { key: "automations", label: "Automations", icon: Zap },
  { key: "email_preview", label: "Email Preview", icon: MailCheck },
];

function AuthGate() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Lock className="w-7 h-7 text-teal-600" />
        </div>
        <p className="font-body text-3xl font-bold text-slate-900 uppercase tracking-tight mb-2">Admin Only</p>
        <p className="font-body text-sm text-slate-500 mb-8">Sign in as an admin to manage emails.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="w-full flex items-center justify-center gap-3 bg-teal-600 text-white font-body text-sm font-semibold py-3.5 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
        >
          Sign in to continue
        </button>
        <Link to="/admin-k" className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
      </div>
    </div>
  );
}

export default function EmailDashboard() {
  const [user, setUser] = useState(undefined);
  const [activeTab, setActiveTab] = useState("crm");

  useEffect(() => {
    document.title = "CRM | Roye Gold";
  }, []);
  const [leads, setLeads] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [meetingsMap, setMeetingsMap] = useState({});
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [leadSettings, setLeadSettings] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [leadData, subData, logData, settingsData] = await Promise.all([
        base44.entities.Lead.list("-created_date", 500),
        base44.entities.NewsletterSubscriber.list("-created_date", 500),
        base44.entities.EmailLog.list("-created_date", 200).catch(() => []),
        base44.entities.LeadSettings.list().catch(() => []),
      ]);
      setLeads(leadData);
      setSubscribers(subData);
      setLogs(logData);
      setLeadSettings(settingsData?.[0] || null);
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    setLoadingData(false);
  }, []);

  const handleToggleSetting = useCallback((fieldName) => async (enabled) => {
    try {
      if (leadSettings?.id) {
        const updated = await base44.entities.LeadSettings.update(leadSettings.id, {
          [fieldName]: enabled,
        });
        setLeadSettings(updated);
      } else {
        const created = await base44.entities.LeadSettings.create({
          [fieldName]: enabled,
          recipient_emails: [],
        });
        setLeadSettings(created);
      }
    } catch (e) {
      console.error(`Failed to update ${fieldName}:`, e);
    }
  }, [leadSettings]);

  const handleToggleAutoEmail = useMemo(() => handleToggleSetting("auto_email_enabled"), [handleToggleSetting]);
  const handleToggleReceiptEmails = useMemo(() => handleToggleSetting("receipt_emails_enabled"), [handleToggleSetting]);
  const handleToggleRefundEmails = useMemo(() => handleToggleSetting("refund_emails_enabled"), [handleToggleSetting]);
  const handleToggleSkoolWelcome = useMemo(() => handleToggleSetting("skool_welcome_email_enabled"), [handleToggleSetting]);

  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const res = await base44.functions.invoke("getCalendlyMeetings", {});
      setMeetingsMap(res.data?.meetingsByEmail || {});
    } catch (e) {
      console.error("Failed to load Calendly meetings:", e);
      setMeetingsMap({});
    }
    setLoadingMeetings(false);
  }, []);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadData();
      loadMeetings();
    }
  }, [user, loadData, loadMeetings]);

  const recipients = useMemo(() => {
    const map = new Map();
    leads.forEach(l => {
      if (l.email) {
        map.set(l.email.toLowerCase(), {
          id: l.id,
          email: l.email,
          name: l.full_name || "",
          phone: l.phone || "",
          source: l.source || "quiz",
          country: l.country || "",
          language: l.browser_language || "",
          date: l.created_date,
        });
      }
    });
    subscribers.forEach(s => {
      if (s.email && !map.has(s.email.toLowerCase())) {
        map.set(s.email.toLowerCase(), {
          id: `nl_${s.id}`,
          email: s.email,
          name: "",
          phone: "",
          source: "newsletter",
          country: "",
          language: "",
          date: s.created_date,
        });
      }
    });
    return Array.from(map.values());
  }, [leads, subscribers]);

  const emailLogMap = useMemo(() => {
    const map = new Map();
    logs.forEach(l => {
      if (!l.recipient_email) return;
      const key = l.recipient_email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (l.status === "sent") existing.sentCount += 1;
        if (new Date(l.created_date) > new Date(existing.lastDate)) {
          existing.lastDate = l.created_date;
        }
        if (l.template_name && !existing.templates.includes(l.template_name)) {
          existing.templates.push(l.template_name);
        }
      } else {
        map.set(key, {
          count: 1,
          sentCount: l.status === "sent" ? 1 : 0,
          lastDate: l.created_date,
          templates: l.template_name ? [l.template_name] : [],
        });
      }
    });
    return map;
  }, [logs]);

  const selectedRecipients = useMemo(() => {
    return recipients.filter(r => selectedIds.has(r.id));
  }, [recipients, selectedIds]);

  const toggleId = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids) => {
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      } else {
        const next = new Set(prev);
        ids.forEach(id => next.add(id));
        return next;
      }
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleSent = useCallback(() => {
    loadData();
    clearSelection();
  }, [loadData, clearSelection]);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return <AuthGate />;

  return (
    <div className="min-h-screen bg-slate-50 flex font-body">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <LayoutDashboard className="w-4.5 h-4.5 text-white" />
          </div>
          <h1 className="font-body text-lg font-bold text-slate-900 uppercase tracking-tight">CRM</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors ${
                activeTab === key
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
              {key === "recipients" && selectedIds.size > 0 && (
                <span className="ml-auto bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {selectedIds.size}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-1">
          <Link
            to="/admin-k"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Back to Admin
          </Link>
          <button
            onClick={() => base44.auth.logout("/admin-k")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">


        {/* Mobile tab navigation */}
        <div className="lg:hidden sticky top-0 z-30 flex border-b border-slate-200 bg-white overflow-x-auto shadow-sm overscroll-x-contain" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-body font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? "text-teal-600 border-teal-600"
                  : "text-slate-500 hover:text-slate-900 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === "recipients" && selectedIds.size > 0 && (
                <span className="ml-1 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {selectedIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 pb-24">
            {loadingData ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "crm" && <CrmContacts meetingsMap={meetingsMap} loadingMeetings={loadingMeetings} onGoToCalendly={() => setActiveTab("calendly")} />}
                  {activeTab === "finances" && <FinancesTab />}
                  {activeTab === "recipients" && (
                    <RecipientList
                      recipients={recipients}
                      selectedIds={selectedIds}
                      onToggle={toggleId}
                      onToggleAll={toggleAll}
                      onClear={clearSelection}
                      emailLogMap={emailLogMap}
                      meetingsMap={meetingsMap}
                      loadingMeetings={loadingMeetings}
                      onRefreshMeetings={loadMeetings}
                    />
                  )}
                  {activeTab === "compose" && (
                    <ComposeEmail
                      selectedRecipients={selectedRecipients}
                      onSent={handleSent}
                      onGoToRecipients={() => setActiveTab("recipients")}
                    />
                  )}
                  {activeTab === "calendly" && (
                    <CalendlyTab
                      meetingsMap={meetingsMap}
                      loading={loadingMeetings}
                      onRefresh={loadMeetings}
                    />
                  )}
                  {activeTab === "kit" && <KitTab />}
                  {activeTab === "history" && <EmailHistory logs={logs} loading={false} />}
                  {activeTab === "email_preview" && <EmailPreviewTab />}
                  {activeTab === "automations" && (
                    <AutomationsTab
                      leadSettings={leadSettings}
                      onToggleAutoEmail={handleToggleAutoEmail}
                      onToggleReceiptEmails={handleToggleReceiptEmails}
                      onToggleRefundEmails={handleToggleRefundEmails}
                      onToggleSkoolWelcome={handleToggleSkoolWelcome}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Sticky bottom bar when recipients selected */}
        {selectedIds.size > 0 && activeTab !== "compose" && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-teal-600" />
                <span className="text-sm text-slate-700 font-body">
                  <span className="font-bold text-teal-600">{selectedIds.size}</span> selected
                </span>
              </div>
              <button
                onClick={() => setActiveTab("compose")}
                className="flex items-center gap-2 bg-teal-600 text-white font-body text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                Compose
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}