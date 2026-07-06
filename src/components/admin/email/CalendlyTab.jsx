import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, Video, RefreshCw, Search, Users, CalendarDays,
  CalendarClock, MapPin, ExternalLink, AlertCircle, History,
} from "lucide-react";
import MeetingNotes from "@/components/admin/email/MeetingNotes";
import { base44 } from "@/api/base44Client";

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meetingDate = new Date(d);
  meetingDate.setHours(0, 0, 0, 0);

  if (meetingDate.getTime() === today.getTime()) return "Today";
  if (meetingDate.getTime() === tomorrow.getTime()) return "Tomorrow";

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  });
}

function formatFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

function getRelativeBadge(dateStr) {
  const now = new Date();
  const meeting = new Date(dateStr);
  const diffMs = meeting - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return { label: "Past", color: "bg-slate-100 text-slate-400" };
  if (diffHours < 2) return { label: "Starting soon", color: "bg-red-100 text-red-600 animate-pulse" };
  if (diffHours < 24) return { label: "Today", color: "bg-amber-100 text-amber-700" };
  if (diffHours < 48) return { label: "Tomorrow", color: "bg-blue-100 text-blue-700" };
  return { label: null, color: "" };
}

export default function CalendlyTab({ meetingsMap, loading, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notesMap, setNotesMap] = useState({});

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await base44.functions.invoke("manageMeetingNote", { action: "load" });
        setNotesMap(res.data?.notesMap || {});
      } catch (e) {
        console.error("Failed to load meeting notes:", e);
      }
    };
    loadNotes();
  }, []);

  const handleNoteSaved = (eventUuid, noteText) => {
    setNotesMap(prev => ({ ...prev, [eventUuid]: { ...prev[eventUuid], notes: noteText } }));
  };

  const handleNoteDeleted = (eventUuid) => {
    setNotesMap(prev => {
      const next = { ...prev };
      delete next[eventUuid];
      return next;
    });
  };

  const allMeetings = useMemo(() => {
    if (!meetingsMap) return [];
    const list = [];
    for (const [email, meetings] of Object.entries(meetingsMap)) {
      meetings.forEach(m => {
        list.push({ ...m, email });
      });
    }
    list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    return list;
  }, [meetingsMap]);

  const filtered = useMemo(() => {
    return allMeetings.filter(m => {
      const now = new Date();
      const meetingDate = new Date(m.start_time);
      const diffHours = (meetingDate - now) / (1000 * 60 * 60);

      if (filter === "today" && diffHours >= 24) return false;
      if (filter === "week" && diffHours >= 7 * 24) return false;
      if (filter === "upcoming" && diffHours < 0) return false;
      if (filter === "past" && diffHours >= 0) return false;

      if (search) {
        const q = search.toLowerCase();
        return (m.invitee_name || "").toLowerCase().includes(q) ||
               (m.invitee_email || "").toLowerCase().includes(q) ||
               (m.event_name || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [allMeetings, search, filter]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayCount = allMeetings.filter(m => (new Date(m.start_time) - now) / (1000 * 60 * 60) < 24 && new Date(m.start_time) > now).length;
    const weekCount = allMeetings.filter(m => (new Date(m.start_time) - now) / (1000 * 60 * 60) < 7 * 24 && new Date(m.start_time) > now).length;
    const total = allMeetings.filter(m => new Date(m.start_time) > now).length;
    const past = allMeetings.filter(m => new Date(m.start_time) < now).length;
    return { today: todayCount, week: weekCount, total, past };
  }, [allMeetings]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(m => {
      const label = formatDateLabel(m.start_time);
      if (!groups[label]) groups[label] = [];
      groups[label].push(m);
    });
    return groups;
  }, [filtered]);

  const statCards = [
    { label: "Upcoming", value: stats.total, icon: CalendarClock, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Today", value: stats.today, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "This Week", value: stats.week, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Past", value: stats.past, icon: History, color: "text-slate-600", bg: "bg-slate-100" },
  ];

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "past", label: "Past" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-body text-base font-bold text-slate-900 uppercase tracking-tight">Calendly Meetings</h2>
        <button onClick={onRefresh} disabled={loading} className="text-slate-400 hover:text-teal-600 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !meetingsMap ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm"
                >
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-1.5`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="font-body text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or event..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
            {filterTabs.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-shrink-0 text-sm font-body px-3.5 py-1.5 rounded-full border transition-colors ${filter === f.key ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Meetings grouped by day */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 font-body text-sm">No meetings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([dayLabel, meetings]) => (
                <div key={dayLabel}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-body font-semibold text-slate-500 uppercase tracking-wide">{dayLabel}</p>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{meetings.length}</span>
                  </div>
                  <div className="space-y-2">
                    {meetings.map((m, i) => {
                      const badge = getRelativeBadge(m.start_time);
                      return (
                        <div
                          key={m.event_uuid + i}
                          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            {/* Time block */}
                            <div className="flex-shrink-0 text-center min-w-[55px]">
                              <p className="text-sm font-bold text-slate-900 font-body">{formatTime(m.start_time)}</p>
                              <p className="text-[10px] text-slate-400">{formatTime(m.end_time)}</p>
                            </div>
                            <div className="w-px bg-slate-200 self-stretch" />
                            {/* Meeting details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-body font-semibold text-slate-900 truncate">{m.invitee_name || "Unknown"}</p>
                                {badge.label && (
                                  <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{m.invitee_email}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <CalendarClock className="w-3 h-3 text-teal-500 flex-shrink-0" />
                                <p className="text-xs text-teal-600 font-body truncate">{m.event_name}</p>
                              </div>
                              {m.location && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <p className="text-[11px] text-slate-500 truncate">{m.location}</p>
                                </div>
                              )}
                              {/* Action links */}
                              <div className="flex items-center gap-3 mt-2">
                                {m.join_url && (
                                  <a
                                    href={m.join_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] font-body text-teal-600 hover:text-teal-700 hover:underline"
                                  >
                                    <Video className="w-3 h-3" /> Join call
                                  </a>
                                )}
                                {m.reschedule_url && (
                                  <a
                                    href={m.reschedule_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] font-body text-slate-500 hover:text-slate-700 hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Reschedule
                                  </a>
                                )}
                                {m.cancel_url && (
                                  <a
                                    href={m.cancel_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] font-body text-red-400 hover:text-red-600 hover:underline"
                                  >
                                    <AlertCircle className="w-3 h-3" /> Cancel
                                  </a>
                                )}
                              </div>
                              <MeetingNotes
                                event_uuid={m.event_uuid}
                                invitee_email={m.invitee_email}
                                invitee_name={m.invitee_name}
                                event_name={m.event_name}
                                start_time={m.start_time}
                                existingNote={notesMap[m.event_uuid]?.notes}
                                onSaved={handleNoteSaved}
                                onDeleted={handleNoteDeleted}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}