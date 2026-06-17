import React, { useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";

export default function DayRow({ d, i, accent, joinUrl }) {
  const rowRef = useRef(null);
  const btnRef = useRef(null);
  const labelRef = useRef(null);
  const isDay1 = d.day === 1;

  const handleEnter = () => {
    if (isDay1) return;
    gsap.to(rowRef.current, { backgroundColor: "#0d1a1a", duration: 0.25, ease: "power2.out" });
    gsap.to(labelRef.current, { color: "#F5F5F5", x: 6, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
      btnRef.current,
      { opacity: 0, x: 12, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
  };

  const handleLeave = () => {
    if (isDay1) return;
    gsap.to(rowRef.current, { backgroundColor: "transparent", duration: 0.2, ease: "power2.in" });
    gsap.to(labelRef.current, { color: "#666", x: 0, duration: 0.2, ease: "power2.in" });
    gsap.to(btnRef.current, { opacity: 0, x: 8, scale: 0.9, duration: 0.2, ease: "power2.in" });
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`flex items-center justify-between py-4 border-b border-[#1e1e1e] rounded-xl transition-none ${
        isDay1 ? "bg-[#0d1a1a] -mx-4 px-4" : "-mx-2 px-2 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-5">
        <span
          className="font-heading text-xs font-bold w-14 flex-shrink-0"
          style={{ color: isDay1 ? accent : "#333" }}
        >
          DAY {d.day}
        </span>
        <span
          ref={labelRef}
          className="font-heading text-xl font-bold uppercase tracking-tight"
          style={{ color: isDay1 ? "#F5F5F5" : "#666" }}
        >
          {d.title}
        </span>
      </div>

      {isDay1 ? (
        <span
          className="text-xs font-body font-bold px-3 py-1 rounded-full flex-shrink-0"
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
          className="flex-shrink-0 flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full opacity-0"
          style={{ backgroundColor: accent, color: "#0a0a0a" }}
        >
          Join Now <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}