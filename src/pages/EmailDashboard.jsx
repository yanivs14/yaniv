import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, LogOut, Users, Send, History, Mail, CheckCircle, XCircle, MailCheck, ListChecks } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import RecipientList from "@/components/admin/email/RecipientList";
import ComposeEmail from "@/components/admin/email/ComposeEmail";
import EmailHistory from "@/components/admin/email/EmailHistory";

const TABS = [
  { key: "recipients", label: "Recipients", icon: Users },
  { key: "compose", label: "Compose", icon: Send },
  { key: "history", label: "History", icon: History },
];

function AuthGate() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-orange-red" />
        </div>
        <p className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-2">Admin Only</p>
        <p className="font-body text-sm text-white-muted mb-8">Sign in as an admin to manage emails.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="w-full flex items-center justify-center gap-3 bg-off-white text-[#0a0a0a] font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors"
        >
          Sign in to continue
        </button>
        <Link to="/admin-k" className="mt-4 inline-flex items-center gap-1.5 text-sm text-white-muted hover:text-off-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </Link>
      </div>
    </div>
  );
}

export default function EmailDashboard() {
  const [user, setUser] = useState(undefined);
  const [activeTab, setActiveTab] = useState("recipients");
  const [leads, setLeads] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [leadData, subData, logData] = await Promise.all([
        base44.entities.Lead.list("-created_date", 500),
        base44.entities.NewsletterSubscriber.list("-created_date", 500),
        base44.entities.EmailLog.list("-created_date", 200).catch(() => []),
      ]);
      setLeads(leadData);
      setSubscribers(subData);
      setLogs(logData);
    } catch (e) {
      console.error("Failed to load data:", e);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (user && user.role === "admin") loadData();
  }, [user, loadData]);

  // Build unified recipients list (deduplicated by email)
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

  // Build a map of email → email log summary (count, last date, templates)
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return <AuthGate />;

  // Stats
  const totalRecipients = recipients.length;
  const totalSent = logs.filter(l => l.status === "sent").length;
  const totalFailed = logs.filter(l => l.status === "failed").length;
  const successRate = totalSent + totalFailed > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 0;

  const stats = [
    { label: "Recipients", value: totalRecipients, icon: Users, color: "text-orange-red" },
    { label: "Emails Sent", value: totalSent, icon: MailCheck, color: "text-green-400" },
    { label: "Failed", value: totalFailed, icon: XCircle, color: "text-red-400" },
    { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle, color: "text-orange-red" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-body">
      {/* Header */}
      <div className="h-14 border-b border-[#1e1e1e] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/admin-k" className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-white-muted hover:text-off-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">Email Hub</h1>
        </div>
        <button onClick={() => base44.auth.logout("/admin-k")} className="text-white-muted hover:text-orange-red transition-colors p-2">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 border-b border-[#1e1e1e]">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
              <Icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="font-heading text-lg font-bold text-off-white leading-none">{s.value}</p>
                <p className="text-[10px] text-white-muted mt-0.5 truncate">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-[#1e1e1e]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-body transition-colors border-b-2 ${activeTab === key ? "text-orange-red border-orange-red" : "text-white-muted hover:text-off-white border-transparent"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {key === "recipients" && selectedIds.size > 0 && (
              <span className="ml-1 bg-orange-red text-dark-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {selectedIds.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-24">
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
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
                {activeTab === "recipients" && (
                  <RecipientList
                    recipients={recipients}
                    selectedIds={selectedIds}
                    onToggle={toggleId}
                    onToggleAll={toggleAll}
                    onClear={clearSelection}
                    emailLogMap={emailLogMap}
                  />
                )}
                {activeTab === "compose" && (
                  <ComposeEmail
                    selectedRecipients={selectedRecipients}
                    onSent={handleSent}
                    onGoToRecipients={() => setActiveTab("recipients")}
                  />
                )}
                {activeTab === "history" && (
                  <EmailHistory logs={logs} loading={false} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Sticky bottom bar when recipients selected */}
      {selectedIds.size > 0 && activeTab !== "compose" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-orange-red" />
              <span className="text-sm text-off-white font-body">
                <span className="font-bold text-orange-red">{selectedIds.size}</span> selected
              </span>
            </div>
            <button
              onClick={() => setActiveTab("compose")}
              className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold px-6 py-2.5 rounded-full hover:bg-orange-red-hover transition-colors"
            >
              Compose
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}