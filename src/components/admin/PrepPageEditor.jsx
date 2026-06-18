import React, { useState, useEffect, useCallback } from "react";
import { Upload, Save, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PAGE_KEY = "movement7prep";

const DEFAULT_DAYS = [
  { day: 1, title: "Hang / Spinal Wave" },
  { day: 2, title: "Joint Prep / Push" },
  { day: 3, title: "Hang / Pull" },
  { day: 4, title: "Juggling / Diagonal Stretch" },
  { day: 5, title: "Joint Prep / Handstand" },
  { day: 6, title: "Hang / Flow" },
  { day: 7, title: "Joint Prep / Legs" },
];

const DEFAULTS = {
  title: "7-Day Movement Preparation",
  description: "A structured 7-day program to give you a soft landing into movement and help you understand the foundations everything else is built on.",
  whoFor: "Beginners to advanced. No experience needed.",
  whatGain: "Better mobility, strength, coordination, and confidence in how your body moves.",
  days: DEFAULT_DAYS,
  todayDay: 1,
  todayNote: "10 minutes. That's the only job today.",
  mediaUrl: "",
  mediaType: "none",
  ctaText: "START DAY 1 →",
  ctaUrl: "",
  communityHeadline: "This is just the entry point.",
  communityBody: "Inside Roye's Skool community, 800+ members get the full movement library, weekly live coaching, and ongoing programming — this challenge is the warm-up.",
  communityCtaText: "Join The Community",
  communityCtaUrl: "https://www.skool.com",
  heroCta1Text: "START THE CHALLENGE →",
  heroCta1Url: "",
  afterDaysCtaText: "START NOW →",
  afterDaysCtaUrl: "",
};

function UploadButton({ onUpload, accept = "image/*", label = "Upload" }) {
  const [loading, setLoading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpload(file_url);
    setLoading(false);
  };
  return (
    <label className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-orange-red transition-colors text-xs text-white-muted hover:text-off-white whitespace-nowrap">
      {loading ? <div className="w-3 h-3 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3 h-3" />}
      {loading ? "Uploading..." : label}
      <input type="file" accept={accept} className="hidden" onChange={handleFile} />
    </label>
  );
}

function F({ label, value, onChange, multiline = false, placeholder = "" }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white-muted mb-1.5 font-body">{label}</label>
      {multiline ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body resize-none focus:outline-none focus:border-orange-red transition-colors" />
      ) : (
        <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="text-xs text-white-muted font-body font-semibold uppercase tracking-wider mb-3 mt-6 border-t border-[#1e1e1e] pt-4">{children}</p>;
}

export default function PrepPageEditor() {
  const [data, setData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.PrepPageContent.filter({ page_key: PAGE_KEY }).then(records => {
      if (records.length > 0) {
        setRecordId(records[0].id);
        setData({ ...DEFAULTS, ...records[0].data });
      } else {
        setData({ ...DEFAULTS });
      }
    });
  }, []);

  const set = useCallback((key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = { page_key: PAGE_KEY, data };
    if (recordId) {
      await base44.entities.PrepPageContent.update(recordId, payload);
    } else {
      const created = await base44.entities.PrepPageContent.create(payload);
      setRecordId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!data) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-white-muted font-body">Edit the /MOVEMENT7PREP landing page</p>
          <a href="/MOVEMENT7PREP" target="_blank" rel="noreferrer"
            className="text-xs text-orange-red underline underline-offset-4 hover:text-orange-red-hover transition-colors">
            Preview page →
          </a>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-xs font-bold px-4 py-2 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
          <Save className="w-3.5 h-3.5" />
          {saved ? "Saved ✓" : saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* ── HERO ── */}
      <SectionTitle>Hero Section</SectionTitle>
      <F label="Page Title" value={data.title} onChange={v => set("title", v)} placeholder="7-Day Movement Preparation" />
      <F label="Description" value={data.description} onChange={v => set("description", v)} multiline />
      <F label="Who it's for" value={data.whoFor} onChange={v => set("whoFor", v)} />
      <F label="What you'll gain" value={data.whatGain} onChange={v => set("whatGain", v)} />
      <F label="Hero CTA — Button Text" value={data.heroCta1Text} onChange={v => set("heroCta1Text", v)} placeholder="START THE CHALLENGE →" />
      <F label="Hero CTA — Button Link" value={data.heroCta1Url} onChange={v => set("heroCta1Url", v)} placeholder="https://..." />

      {/* ── DAYS ── */}
      <SectionTitle>Program Days</SectionTitle>
      <p className="text-xs text-white-dim font-body mb-3">Each row = one day. Edit titles or reorder as needed.</p>
      {(data.days || []).map((d, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <span className="text-xs text-white-dim font-body w-12 flex-shrink-0 text-center">Day {d.day}</span>
          <input
            value={d.title}
            onChange={e => {
              const arr = [...(data.days || [])];
              arr[i] = { ...arr[i], title: e.target.value };
              set("days", arr);
            }}
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors"
          />
          <button onClick={() => set("days", (data.days || []).filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => set("days", [...(data.days || []), { day: (data.days || []).length + 1, title: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-2">
        <Plus className="w-4 h-4" /> Add day
      </button>

      {/* ── AFTER DAYS CTA ── */}
      <SectionTitle>CTA After 7 Days List</SectionTitle>
      <F label="Button Text" value={data.afterDaysCtaText} onChange={v => set("afterDaysCtaText", v)} placeholder="START NOW →" />
      <F label="Button Link" value={data.afterDaysCtaUrl} onChange={v => set("afterDaysCtaUrl", v)} placeholder="https://..." />

      {/* ── TODAY BLOCK ── */}
      <SectionTitle>Today's Block (Day 1 Highlight)</SectionTitle>
      <F label="Today Note" value={data.todayNote} onChange={v => set("todayNote", v)} placeholder="10 minutes. That's the only job today." />

      {/* Media */}
      <div className="mb-4">
        <label className="block text-xs text-white-muted mb-1.5 font-body">Media Type (video shown in Today's block)</label>
        <select value={data.mediaType || "none"} onChange={e => set("mediaType", e.target.value)}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red">
          <option value="none">No media</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      {data.mediaType !== "none" && (
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <input value={data.mediaUrl || ""} onChange={e => set("mediaUrl", e.target.value)}
              placeholder="Paste URL or upload..."
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <UploadButton
              accept={data.mediaType === "video" ? "video/*" : "image/*"}
              label={data.mediaType === "video" ? "Video" : "Image"}
              onUpload={v => set("mediaUrl", v)}
            />
          </div>
          {data.mediaUrl && data.mediaType === "image" && (
            <img src={data.mediaUrl} alt="" className="w-full h-40 object-cover rounded-lg border border-[#2a2a2a]" />
          )}
          {data.mediaUrl && data.mediaType === "video" && (
            <video src={data.mediaUrl} className="w-full h-40 object-cover rounded-lg border border-[#2a2a2a]" muted playsInline />
          )}
        </div>
      )}
      {data.mediaType === "video" && (
        <div className="mb-4">
          <label className="block text-xs text-white-muted mb-1.5 font-body">Poster Image (thumbnail shown before play)</label>
          <div className="flex gap-2 mb-2">
            <input value={data.posterUrl || ""} onChange={e => set("posterUrl", e.target.value)}
              placeholder="Paste URL or upload..."
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <UploadButton accept="image/*" label="Upload Poster" onUpload={v => set("posterUrl", v)} />
          </div>
          {data.posterUrl && (
            <img src={data.posterUrl} alt="poster" className="w-full h-40 object-cover rounded-lg border border-[#2a2a2a]" />
          )}
        </div>
      )}

      <F label="CTA Button Text" value={data.ctaText} onChange={v => set("ctaText", v)} placeholder="START DAY 1 →" />
      <F label="CTA Button Link" value={data.ctaUrl} onChange={v => set("ctaUrl", v)} placeholder="https://..." />

      {/* ── COMMUNITY SECTION ── */}
      <SectionTitle>Want More / Community Section</SectionTitle>
      <F label="Headline" value={data.communityHeadline} onChange={v => set("communityHeadline", v)} />
      <F label="Body Text" value={data.communityBody} onChange={v => set("communityBody", v)} multiline />
      <F label="Button Text" value={data.communityCtaText} onChange={v => set("communityCtaText", v)} placeholder="Join The Community" />
      <F label="Button Link" value={data.communityCtaUrl} onChange={v => set("communityCtaUrl", v)} placeholder="https://www.skool.com/..." />

      {/* Bottom Save */}
      <div className="mt-8 pt-6 border-t border-[#1e1e1e]">
        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-orange-red text-dark-bg font-body text-sm font-bold py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
          <Save className="w-4 h-4" />
          {saved ? "Saved ✓" : saving ? "Saving..." : "Save all changes"}
        </button>
      </div>
    </div>
  );
}