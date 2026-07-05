import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Smartphone, Tablet, Mail, ChevronLeft, Send, Zap } from "lucide-react";
import { EMAIL_TEMPLATES } from "@/lib/emailTemplates";

const DEVICES = [
  { key: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { key: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { key: "mobile", label: "Mobile", icon: Smartphone, width: "375px" },
];

export default function EmailPreviewTab() {
  const [selectedId, setSelectedId] = useState(EMAIL_TEMPLATES[0].id);
  const [device, setDevice] = useState("desktop");
  const iframeRef = useRef(null);

  const selected = EMAIL_TEMPLATES.find(t => t.id === selectedId);
  const deviceConfig = DEVICES.find(d => d.key === device);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Template list — sidebar on desktop, top bar on mobile */}
      <div className="lg:w-72 flex-shrink-0">
        <p className="text-xs font-body font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">
          {EMAIL_TEMPLATES.length} Email Templates
        </p>
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0" style={{ scrollbarWidth: "none" }}>
          {EMAIL_TEMPLATES.map(t => {
            const Icon = Mail;
            const isActive = selectedId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`flex-shrink-0 lg:flex-shrink flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all w-full ${
                  isActive
                    ? "bg-white border-teal-400 shadow-sm ring-1 ring-teal-500/10"
                    : "bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-body font-semibold truncate ${isActive ? "text-teal-700" : "text-slate-900"}`}>
                    {t.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 hidden lg:block">{t.description}</p>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 mt-1 hidden lg:inline-flex">
                    <Zap className="w-2.5 h-2.5" /> {t.trigger}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId + device}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Preview header */}
            <div className="border-b border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-body font-bold text-slate-900 truncate">{selected.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{selected.description}</p>
                </div>
                {/* Device toggle */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
                  {DEVICES.map(d => {
                    const Icon = d.icon;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setDevice(d.key)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-body font-medium transition-colors ${
                          device === d.key
                            ? "bg-white text-teal-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                        title={d.label}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Subject line */}
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <Send className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-[10px] uppercase tracking-wide text-slate-400 flex-shrink-0">Subject</span>
                <span className="text-xs font-body text-slate-700 truncate">{selected.subject}</span>
              </div>
            </div>

            {/* Iframe preview */}
            <div className="bg-slate-100 p-3 sm:p-4 flex justify-center" style={{ minHeight: "500px" }}>
              <div
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mx-auto"
                style={{
                  width: deviceConfig.width,
                  maxWidth: "100%",
                }}
              >
                <iframe
                  ref={iframeRef}
                  title={selected.name}
                  srcDoc={selected.html}
                  className="w-full border-0"
                  style={{ minHeight: "600px", display: "block" }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Device width indicator */}
            <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-body">
                Preview width: <span className="font-semibold text-slate-600">{deviceConfig.width === "100%" ? "Full (max 560px)" : deviceConfig.width}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-body">
                Trigger: <span className="font-semibold text-slate-600">{selected.trigger}</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}