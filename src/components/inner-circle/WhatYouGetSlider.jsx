import React, { useRef, useState } from "react";
import {
  Star, Zap, Video, RefreshCw, MessageCircle, Lock,
  Target, Dumbbell, Heart, Brain, Shield, Trophy,
  Flame, Clock, Users, CheckCircle, ArrowRight, Sparkles
} from "lucide-react";

const TAG_ICONS = {
  Foundation: Star, Custom: Target, Live: Video, Adaptive: RefreshCw,
  Support: MessageCircle, Exclusive: Lock, Strength: Dumbbell, Health: Heart,
  Mindset: Brain, Safety: Shield, Results: Trophy, Energy: Flame,
  Schedule: Clock, Community: Users, Verified: CheckCircle,
  Growth: ArrowRight, Premium: Sparkles, Power: Zap,
};

function getIcon(tag) {
  if (!tag) return Star;
  if (TAG_ICONS[tag]) return TAG_ICONS[tag];
  const lower = tag.toLowerCase();
  for (const [key, Icon] of Object.entries(TAG_ICONS)) {
    if (lower.includes(key.toLowerCase())) return Icon;
  }
  return CheckCircle;
}

function Card({ item, accent }) {
  const Icon = getIcon(item.tag);
  return (
    <div
      className="flex-shrink-0 w-[78vw] max-w-[300px] rounded-3xl p-6 flex flex-col gap-4 border border-white/10 select-none"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))" }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accent}22` }}>
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>
      <span className="text-[10px] font-heading font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit"
        style={{ backgroundColor: `${accent}18`, color: accent }}>
        {item.tag}
      </span>
      <p className="font-body text-sm text-[#c8c8c8] leading-relaxed">{item.label}</p>
    </div>
  );
}

export default function WhatYouGetSlider({ items = [], accent = "#FF2DF1" }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [offset, setOffset] = useState(0);
  const touchStartX = useRef(null);
  const touchStartOffset = useRef(0);
  const dragging = useRef(false);

  const CARD_WIDTH = typeof window !== "undefined" ? Math.min(window.innerWidth * 0.78, 300) + 16 : 316;

  const clamp = (val) => Math.max(-(items.length - 1) * CARD_WIDTH, Math.min(0, val));

  const snapTo = (idx) => {
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    setActiveIdx(clamped);
    setOffset(-clamped * CARD_WIDTH);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartOffset.current = offset;
    dragging.current = true;
  };

  const onTouchMove = (e) => {
    if (!dragging.current || touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    setOffset(clamp(touchStartOffset.current + delta));
  };

  const onTouchEnd = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) {
      snapTo(activeIdx);
    } else {
      snapTo(delta < 0 ? activeIdx + 1 : activeIdx - 1);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex gap-4 px-6"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
          willChange: "transform",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((item, i) => (
          <Card key={i} item={item} accent={accent} />
        ))}
        <div className="flex-shrink-0 w-6" />
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => snapTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === activeIdx ? 24 : 6,
              height: 6,
              backgroundColor: i === activeIdx ? accent : "#333",
            }}
          />
        ))}
      </div>
    </div>
  );
}