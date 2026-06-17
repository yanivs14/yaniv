import React, { useRef, useState } from "react";
import { gsap } from "gsap";

export default function DayRow({ d, i, accent, joinUrl }) {
  const rowRef = useRef(null);
  const btnRef = useRef(null);
  const labelRef = useRef(null);
  const isDay1 = d.day === 1;
  const hoverTimeout = useRef(null);

  const handleEnter = () => {
    if (isDay1) return;
    // Clear any pending leave
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    gsap.to(rowRef.current, { backgroundColor: "#0d1a1a", duration: 0.3, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#F5F5F5", x: 4, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      btnRef.current,
      { opacity: 0, x: 16, scale: 0.85 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, delay: 0.05, ease: "back.out(1.4)" }
    );
  };

  const handleLeave = () => {
    if (isDay1) return;
    hoverTimeout.current = setTimeout(() => {
      gsap.to(rowRef.current, { backgroundColor: "transparent", duration: 0.25, ease: "power2.in" });
      gsap.to(labelRef.current, { color: "#666", x: 0, duration: 0.25, ease: "power2.in" });
      gsap.to(btnRef.current, { opacity: 0, x: 10, scale: 0.85, duration: 0.2, ease: "power2.in" });
    }, 80);
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`flex items-center justify-between py-4 border-b border-[#1e1e1e] rounded-xl ${
        isDay1 ? "bg-[#0d1a1a] -mx-4 px-4" : "-mx-2 px-2 cursor-pointer"
      }`}
      style={{ minHeight: "60px" }}
    >
      {/* Day label */}
      <span
        className="font-heading text-xs font-bold flex-shrink-0 w-10 mr-3"
        style={{ color: isDay1 ? accent : "#333" }}
      >
        DAY {d.day}
      </span>

      {/* Title — takes all remaining space, no wrap */}
      <span
        ref={labelRef}
        className="font-heading text-lg sm:text-xl font-bold uppercase tracking-tight flex-1 min-w-0 truncate"
        style={{ color: isDay1 ? "#F5F5F5" : "#666" }}
      >
        {d.title}
      </span>

      {/* Badge / Button */}
      <div className="flex-shrink-0 ml-3">
        {isDay1 ? (
          <span
            className="text-xs font-body font-bold px-3 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: accent, color: "#0a0a0a" }}
          >
            TODAY
          </span>
        ) : (
          <a
            ref={btnRef}
            href={joinUrl || "#"}
            target={joinUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={e => !joinUrl && e.preventDefault()}
            className="font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap opacity-0 inline-block"
            style={{ backgroundColor: accent, color: "#0a0a0a" }}
          >
            Join Now
          </a>
        )}
      </div>
    </div>
  );
}