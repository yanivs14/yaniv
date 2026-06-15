import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  Star, Zap, Video, RefreshCw, MessageCircle, Lock,
  Target, Dumbbell, Heart, Brain, Shield, Trophy,
  Flame, Clock, Users, CheckCircle, ArrowRight, Sparkles
} from "lucide-react";

// Tag → icon mapping
const TAG_ICONS = {
  Foundation: Star,
  Custom: Target,
  Live: Video,
  Adaptive: RefreshCw,
  Support: MessageCircle,
  Exclusive: Lock,
  Strength: Dumbbell,
  Health: Heart,
  Mindset: Brain,
  Safety: Shield,
  Results: Trophy,
  Energy: Flame,
  Schedule: Clock,
  Community: Users,
  Verified: CheckCircle,
  Growth: ArrowRight,
  Premium: Sparkles,
  Power: Zap,
};

function getIcon(tag) {
  if (!tag) return Star;
  // Try exact match first, then partial
  const exact = TAG_ICONS[tag];
  if (exact) return exact;
  const lower = tag.toLowerCase();
  for (const [key, Icon] of Object.entries(TAG_ICONS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return Icon;
  }
  return CheckCircle;
}

function Card({ item, accent, index }) {
  const Icon = getIcon(item.tag);
  return (
    <motion.div
      className="flex-shrink-0 w-[78vw] max-w-[300px] rounded-3xl p-6 flex flex-col gap-4 border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm select-none"
      style={{ boxShadow: `0 0 40px ${accent}18` }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accent}22` }}
      >
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>

      {/* Tag badge */}
      <span
        className="text-[10px] font-heading font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        {item.tag}
      </span>

      {/* Label */}
      <p className="font-body text-sm text-[#c8c8c8] leading-relaxed">{item.label}</p>
    </motion.div>
  );
}

export default function WhatYouGetSlider({ items = [], accent = "#FF2DF1" }) {
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const startX = useRef(0);
  const startVal = useRef(0);

  const cardW = () => {
    if (!trackRef.current) return 300;
    const card = trackRef.current.querySelector("[data-card]");
    return card ? card.offsetWidth + 16 : 300; // 16 = gap
  };

  const clamp = (val) => {
    const max = 0;
    const min = -(items.length - 1) * cardW();
    return Math.max(min, Math.min(max, val));
  };

  const snapTo = (idx) => {
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    setActiveIdx(clamped);
    animate(x, -clamped * cardW(), { type: "spring", stiffness: 300, damping: 30 });
  };

  // Drag handlers
  const onPointerDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX || e.touches?.[0]?.clientX;
    startVal.current = x.get();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const cx = e.clientX || e.touches?.[0]?.clientX;
    const delta = cx - startX.current;
    x.set(clamp(startVal.current + delta));
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const cx = e.clientX || e.changedTouches?.[0]?.clientX;
    const delta = cx - startX.current;
    const threshold = 50;
    if (Math.abs(delta) < threshold) {
      snapTo(activeIdx);
    } else {
      snapTo(delta < 0 ? activeIdx + 1 : activeIdx - 1);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Track */}
      <motion.div
        ref={trackRef}
        className="flex gap-4 px-6 cursor-grab active:cursor-grabbing"
        style={{ x }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        drag={false}
      >
        {items.map((item, i) => (
          <div key={i} data-card>
            <Card item={item} accent={accent} index={i} />
          </div>
        ))}
        {/* Trailing spacer */}
        <div className="flex-shrink-0 w-6" />
      </motion.div>

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