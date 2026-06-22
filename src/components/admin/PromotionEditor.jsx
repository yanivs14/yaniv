import React, { useState, useEffect, useCallback } from "react";
import { Upload, Save, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PAGE_KEY = "promotion";

const DEFAULTS = {
  headline: "Fix Your Pull Up In 7 Days",
  subtitle: "Not with more reps. Not with bands. With the one movement pattern your body has been missing.",
  description: "Arch Scap — the foundation of every pull, every hang, every strong back. Taught by Roye Gold. 10 min/day.",
  promoText: "$25/mo for the first 3 months if you sign up in the next 24 hours!",
  videoUrl: "",
  videoPosterUrl: "",
  ctaText: "START NOW →",
  ctaUrl: "",
  pricingEyebrow: "Membership",
  pricingTitle: "Join The Movement",
  pricingSubtitle: "Monthly — Cancel Anytime",
  pricingPlanName: "Monthly",
  pricingPrice: "$25",
  pricingPeriod: "/ month",
  pricingBadge: "Limited Time Offer",
  pricingPriceNote: "First 3 months only — then $35/mo",
  pricingCta: "Begin Monthly",
  pricingFooter: "Cancel anytime · No equipment needed",
  pricingFeatures: [
    "Personalized adaptive daily practice",
    "Full Movement training library (240+ sessions)",
    "Strength, mobility, control & longevity tracks",
    "Community access + challenges",
  ],
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

export default function PromotionEditor() {
  const [data, setData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.PromotionPageContent.filter({ page_key: PAGE_KEY }).then(records => {
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
      await base44.entities.PromotionPageContent.update(recordId, payload);
    } else {
      const created = await base44.entities.PromotionPageContent.create(payload);
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
          <p className="text-xs text-white-muted font-body">Edit the /promotion landing page</p>
          <a href="/promotion" target="_blank" rel="noreferrer"
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
      <F label="Headline" value={data.headline} onChange={v => set("headline", v)} placeholder="Fix Your Pull Up In 7 Days" />
      <F label="Subtitle" value={data.subtitle} onChange={v => set("subtitle", v)} multiline />
      <F label="Description" value={data.description} onChange={v => set("description", v)} multiline />

      {/* ── VIDEO ── */}
      <SectionTitle>Video</SectionTitle>
      <div className="mb-4">
        <label className="block text-xs text-white-muted mb-1.5 font-body">Video URL</label>
        <div className="flex gap-2 mb-2">
          <input value={data.videoUrl || ""} onChange={e => set("videoUrl", e.target.value)}
            placeholder="Paste URL or upload..."
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <UploadButton accept="video/*" label="Upload Video" onUpload={v => set("videoUrl", v)} />
        </div>
        {data.videoUrl && (
          <video src={data.videoUrl} className="w-full h-40 object-cover rounded-lg border border-[#2a2a2a]" muted playsInline />
        )}
        {data.videoUrl && (
          <button onClick={() => set("videoUrl", "")} className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">
            Remove video
          </button>
        )}
      </div>

      {/* Poster */}
      {data.videoUrl && (
        <div className="mb-4">
          <label className="block text-xs text-white-muted mb-1.5 font-body">Poster Image (thumbnail before play)</label>
          <div className="flex gap-2 mb-2">
            <input value={data.videoPosterUrl || ""} onChange={e => set("videoPosterUrl", e.target.value)}
              placeholder="Paste URL or upload..."
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <UploadButton accept="image/*" label="Upload Poster" onUpload={v => set("videoPosterUrl", v)} />
          </div>
          {data.videoPosterUrl && (
            <img src={data.videoPosterUrl} alt="poster" className="w-full h-40 object-cover rounded-lg border border-[#2a2a2a]" />
          )}
        </div>
      )}

      {/* ── PROMO BANNER ── */}
      <SectionTitle>Promo Banner</SectionTitle>
      <F label="Promo Text" value={data.promoText} onChange={v => set("promoText", v)} multiline placeholder="$25/mo for the first 3 months if you sign up in the next 24 hours!" />
      <F label="CTA Button Text" value={data.ctaText} onChange={v => set("ctaText", v)} placeholder="START NOW →" />
      <F label="CTA Button Link (optional — leave empty to scroll to pricing)" value={data.ctaUrl} onChange={v => set("ctaUrl", v)} placeholder="https://..." />

      {/* ── PRICING SECTION ── */}
      <SectionTitle>Pricing Section ($25/mo Single Plan)</SectionTitle>
      <F label="Eyebrow" value={data.pricingEyebrow} onChange={v => set("pricingEyebrow", v)} placeholder="Membership" />
      <F label="Title" value={data.pricingTitle} onChange={v => set("pricingTitle", v)} placeholder="Join The Movement" />
      <F label="Subtitle" value={data.pricingSubtitle} onChange={v => set("pricingSubtitle", v)} placeholder="Monthly — Cancel Anytime" />
      <F label="Plan Name" value={data.pricingPlanName} onChange={v => set("pricingPlanName", v)} placeholder="Monthly" />
      <F label="Price (large)" value={data.pricingPrice} onChange={v => set("pricingPrice", v)} placeholder="$25" />
      <F label="Period (after price)" value={data.pricingPeriod} onChange={v => set("pricingPeriod", v)} placeholder="/ month" />
      <F label="Badge (top of card)" value={data.pricingBadge} onChange={v => set("pricingBadge", v)} placeholder="Limited Time Offer" />
      <F label="Price Note (under price)" value={data.pricingPriceNote} onChange={v => set("pricingPriceNote", v)} placeholder="First 3 months only — then $35/mo" />
      <F label="CTA Button Text" value={data.pricingCta} onChange={v => set("pricingCta", v)} placeholder="Begin Monthly" />
      <F label="Footer Text" value={data.pricingFooter} onChange={v => set("pricingFooter", v)} placeholder="Cancel anytime · No equipment needed" />
      <p className="text-xs text-white-muted font-body mb-2 mt-2">Pricing Features</p>
      {(data.pricingFeatures || []).map((feat, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={feat} onChange={e => { const arr = [...(data.pricingFeatures || [])]; arr[i] = e.target.value; set("pricingFeatures", arr); }}
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <button onClick={() => set("pricingFeatures", (data.pricingFeatures || []).filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-2 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => set("pricingFeatures", [...(data.pricingFeatures || []), ""])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors">
        <Plus className="w-4 h-4" /> Add feature
      </button>

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