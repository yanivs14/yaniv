import React, { useEffect, useState } from "react";
import { Calendar, Clock, ChevronLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDateKey(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// step: "date" | "time"
export default function CalendlySlots({ onSlotSelected }) {
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
    return <p className="font-body text-sm text-white-muted py-4">{error || "No upcoming slots available."}</p>;
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
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-orange-red" />
        <span className="font-body text-sm font-semibold text-off-white uppercase tracking-widest">
          {selectedDate ? "Pick a Time" : "Pick a Date"}
        </span>
        {selectedDate && (
          <button
            onClick={() => { setSelectedDate(null); onSlotSelected(null); }}
            className="ml-auto flex items-center gap-1 font-body text-xs text-white-muted hover:text-off-white transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        )}
      </div>

      {!selectedDate ? (
        // Date grid — 2 per row
        <div className="grid grid-cols-2 gap-2">
          {dates.map(date => (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); onSlotSelected(null); }}
              className="flex flex-col items-start border border-dark-border bg-dark-bg hover:border-orange-red hover:text-orange-red text-off-white font-body px-3 py-3 rounded-xl transition-colors group"
            >
              <span className="text-sm font-semibold">{date}</span>
              <span className="text-xs text-white-dim group-hover:text-orange-red/70 transition-colors mt-0.5">
                {grouped[date].length} slots
              </span>
            </button>
          ))}
        </div>
      ) : (
        // Time grid — 2 per row
        <div>
          <p className="font-body text-xs text-white-dim uppercase tracking-widest mb-2">{selectedDate}</p>
          <div className="grid grid-cols-2 gap-2">
            {grouped[selectedDate].map((slot, i) => (
              <button
                key={i}
                onClick={() => onSlotSelected(slot)}
                className="inline-flex items-center gap-1.5 border border-dark-border bg-dark-surface hover:border-orange-red hover:text-orange-red text-white-muted font-body text-xs px-3 py-2.5 rounded-xl transition-colors group w-full"
              >
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{formatTime(slot.start_time)}</span>
                {slot.duration && <span className="text-white-dim ml-auto">· {slot.duration}m</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}