import React, { useRef } from "react";
import { gsap } from "gsap";

export default function DayRow({ d, accent, joinUrl }) {
  const rowRef = useRef(null);
  const btnRef = useRef(null);
  const labelRef = useRef(null);
  const isDay1 = d.day === 1;

  const handleEnter = () => {
    if (isDay1) return;
    gsap.killTweensOf([rowRef.current, btnRef.current, labelRef.current]);
    gsap.to(rowRef.current, { backgroundColor: "#0d1a1a", duration: 0.35, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#F5F5F5", x: 4, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (isDay1) return;
    gsap.killTweensOf([rowRef.current, btnRef.current, labelRef.current]);
    gsap.to(rowRef.current, { backgroundColor: "transparent", duration: 0.35, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#666", x: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(btnRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
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
      <span
        className="font-heading text-xs font-bold flex-shrink-0 w-10 mr-3"
        style={{ color: isDay1 ? accent : "#333" }}
      >
        DAY {d.day}
      </span>

      <span
        ref={labelRef}
        className="font-heading text-lg sm:text-xl font-bold uppercase tracking-tight flex-1 min-w-0 truncate"
        style={{ color: isDay1 ? "#F5F5F5" : "#666" }}
      >
        {d.title}
      </span>

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
            className="font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap inline-block"
            style={{ backgroundColor: accent, color: "#0a0a0a", opacity: 0 }}
          >
            Join Now
          </a>
        )}
      </div>
    </div>
  );
}