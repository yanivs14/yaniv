import React, { useEffect, useState } from "react";
import { Calendar, Clock, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDateKey(isoString) {
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
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    base44.functions.invoke("getCalendlySlots", {})
      .then(res => setSlots(res.data?.slots || []))
      .catch(() => setError("Could not load slots"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-white-muted">
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

  // Group by date, only up to 7 days ahead
  const now = new Date();
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + 7);

  const grouped = {};
  slots.forEach(slot => {
    const slotDate = new Date(slot.start_time);
    if (slotDate <= maxDate) {
      const key = formatDateKey(slot.start_time);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(slot);
    }
  });

  const dates = Object.keys(grouped);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-orange-red" />
        <span className="font-body text-sm font-semibold text-off-white uppercase tracking-widest">
          {selectedDate ? "Pick a Time" : "Pick a Date"}
        </span>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="ml-auto flex items-center gap-1 font-body text-xs text-white-muted hover:text-off-white transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        )}
      </div>

      {!selectedDate ? (
        // Date picker
        <div className="flex flex-col gap-2">
          {dates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className="flex items-center justify-between w-full border border-dark-border bg-dark-bg hover:border-orange-red hover:text-orange-red text-off-white font-body text-sm px-4 py-3 rounded-xl transition-colors group"
            >
              <span>{date}</span>
              <div className="flex items-center gap-1.5 text-white-dim group-hover:text-orange-red transition-colors">
                <span className="text-xs">{grouped[date].length} slots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Time picker
        <div>
          <p className="font-body text-xs text-white-dim uppercase tracking-widest mb-3">{selectedDate}</p>
          <div className="flex flex-wrap gap-2">
            {grouped[selectedDate].map((slot, i) => (
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
      )}
    </div>
  );
}