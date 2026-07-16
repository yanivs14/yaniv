import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    };
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

export default function PreOrderCountdown({ targetDate, compact = false }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);
  if (expired) return null;
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1 mt-0.5">
        {units.map((u, i) => (
          <React.Fragment key={u.label}>
            <span className="font-heading text-xs font-bold text-off-white tabular-nums leading-none">
              {String(u.value).padStart(2, "0")}
            </span>
            {i < units.length - 1 && <span className="text-white-dim text-[10px]">:</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-teal-400/20 rounded-2xl blur-sm" />
            <div className="relative bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 text-center min-w-[56px] sm:min-w-[80px] shadow-sm">
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-600 tabular-nums leading-none">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-gray-500 mt-1">{u.label}</div>
            </div>
          </motion.div>
          {i < units.length - 1 && <span className="font-heading text-xl sm:text-2xl text-gray-300 -mx-1">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}