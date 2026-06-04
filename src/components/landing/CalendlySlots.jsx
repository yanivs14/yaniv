import React, { useEffect, useState } from "react";
import { Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function CalendlySlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke("getCalendlySlots", {})
      .then(res => {
        setSlots(res.data?.slots || []);
      })
      .catch(err => setError("Could not load slots"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-white-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-body text-sm">Loading available slots...</span>
      </div>
    );
  }

  if (error || slots.length === 0) {
    return (
      <p className="font-body text-sm text-white-muted py-4">
        {error || "No upcoming slots available."}
      </p>
    );
  }

  // Group by date
  const grouped = {};
  slots.forEach(slot => {
    const dateKey = formatDate(slot.start_time);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(slot);
  });

  return (
    <div className="mt-8 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-orange-red" />
        <span className="font-body text-sm font-semibold text-off-white uppercase tracking-widest">Available Slots</span>
      </div>

      {Object.entries(grouped).map(([date, daySlots]) => (
        <div key={date}>
          <p className="font-body text-xs text-white-dim uppercase tracking-widest mb-2">{date}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot, i) => (
              <a
                key={i}
                href={slot.scheduling_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-dark-border bg-dark-surface hover:border-orange-red hover:text-orange-red text-white-muted font-body text-xs px-3 py-2 rounded-full transition-colors group"
              >
                <Clock className="w-3 h-3 flex-shrink-0" />
                {formatTime(slot.start_time)}
                {slot.duration && <span className="text-white-dim">· {slot.duration}m</span>}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}