import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Video, Clock, AlertCircle, ChevronRight } from "lucide-react";

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function getRelativeLabel(dateStr) {
  const now = new Date();
  const meeting = new Date(dateStr);
  const diffMs = meeting - now;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 0) return { label: "Past", color: "text-slate-400", urgent: false };
  if (diffMins < 60) return { label: `In ${diffMins}m`, color: "text-red-600", urgent: true };
  if (diffHours < 24) return { label: `In ${diffHours}h`, color: "text-amber-600", urgent: true };
  return { label: null, color: "", urgent: false };
}

export default function UpcomingMeetingsBanner({ meetingsMap, onViewAll }) {
  const upcoming = useMemo(() => {
    if (!meetingsMap) return [];
    const now = new Date();
    const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const list = [];
    for (const [email, meetings] of Object.entries(meetingsMap)) {
      meetings.forEach(m => {
        const start = new Date(m.start_time);
        if (start > now && start < cutoff) {
          list.push({ ...m, email });
        }
      });
    }
    list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    return list;
  }, [meetingsMap]);

  if (upcoming.length === 0) return null;

  const hasUrgent = upcoming.some(m => getRelativeLabel(m.start_time).urgent);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`mb-4 rounded-xl border-2 overflow-hidden shadow-sm ${hasUrgent ? "border-red-200 bg-red-50/50" : "border-teal-200 bg-teal-50/50"}`}
      >
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${hasUrgent ? "border-red-200 bg-red-100/50" : "border-teal-200 bg-teal-100/50"}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${hasUrgent ? "bg-red-500" : "bg-teal-500"}`}>
            <CalendarClock className="w-4 h-4 text-white" />
          </div>
          <p className={`text-sm font-body font-bold ${hasUrgent ? "text-red-700" : "text-teal-700"}`}>
            {upcoming.length} {upcoming.length === 1 ? "upcoming meeting" : "upcoming meetings"}
          </p>
          <p className="text-xs text-slate-500">· next 48 hours</p>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="ml-auto flex items-center gap-1 text-xs font-body text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {upcoming.slice(0, 4).map((m, i) => {
            const rel = getRelativeLabel(m.start_time);
            return (
              <div key={m.event_uuid + i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/50 transition-colors">
                <div className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-body font-bold ${rel.urgent ? "text-red-600" : "text-teal-600"}`}>
                  {rel.urgent && <AlertCircle className="w-3 h-3 animate-pulse" />}
                  {rel.label || formatTime(m.start_time)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-body font-semibold text-slate-900 truncate">
                    {m.invitee_name || m.email}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{m.event_name}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatTime(m.start_time)}
                </span>
                {m.join_url && (
                  <a
                    href={m.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-body text-teal-600 hover:text-teal-700 hover:underline flex-shrink-0"
                  >
                    <Video className="w-3 h-3" /> Join
                  </a>
                )}
              </div>
            );
          })}
          {upcoming.length > 4 && (
            <div className="px-4 py-2 text-center">
              <p className="text-[11px] text-slate-400">
                + {upcoming.length - 4} more in the next 48 hours
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}