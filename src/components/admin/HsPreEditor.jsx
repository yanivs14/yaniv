import React, { useState, useEffect, useCallback } from "react";
import { Upload, Save, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { HSPRE_DEFAULTS, saveHsPreContent } from "@/lib/hspreContent";

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

export default function HsPreEditor() {
  const [data, setData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.PrepPageContent.filter({ page_key: "hspre" }).then(records => {
      if (records.length > 0) {
        setRecordId(records[0].id);
        setData({ ...HSPRE_DEFAULTS, ...records[0].data });
      } else {
        setData({ ...HSPRE_DEFAULTS });
      }
    });
  }, []);

  const set = useCallback((key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const result = await saveHsPreContent(data, recordId);
      if (!recordId && result?.id) setRecordId(result.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-white-muted font-body">Edit the /hspre landing page</p>
          <a href="/hspre" target="_blank" rel="noreferrer"
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
      <div className="mb-4">
        <label className="block text-xs text-white-muted mb-1.5 font-body">Hero Background Image</label>
        <div className="flex gap-2 mb-2">
          <input value={data.heroImage || ""} onChange={e => set("heroImage", e.target.value)}
            placeholder="Paste URL or upload..."
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <UploadButton accept="image/*" label="Upload Image" onUpload={v => set("heroImage", v)} />
        </div>
        {data.heroImage && (
          <img src={data.heroImage} alt="hero" className="w-full h-40 object-cover rounded-lg border border-[#2a2a2a]" />
        )}
      </div>
      <F label="Title — Line 1" value={data.heroTitleLine1} onChange={v => set("heroTitleLine1", v)} placeholder="Master The" />
      <F label="Title — Highlight (colored)" value={data.heroTitleHighlight} onChange={v => set("heroTitleHighlight", v)} placeholder="Handstand" />
      <F label="Description" value={data.heroDescription} onChange={v => set("heroDescription", v)} multiline />
      <F label="CTA Button Text" value={data.heroCtaText} onChange={v => set("heroCtaText", v)} placeholder="Explore the Program" />
      <F label="CTA Button Link" value={data.heroCtaLink} onChange={v => set("heroCtaLink", v)} placeholder="#program" />

      {/* ── INTRO ── */}
      <SectionTitle>Intro Section</SectionTitle>
      <F label="Paragraph 1 — Text Before Highlight" value={data.introP1Before} onChange={v => set("introP1Before", v)} multiline />
      <F label="Paragraph 1 — Highlight (colored)" value={data.introP1Highlight} onChange={v => set("introP1Highlight", v)} />
      <F label="Paragraph 1 — Text After Highlight" value={data.introP1After} onChange={v => set("introP1After", v)} multiline />
      <F label="Paragraph 2" value={data.introP2} onChange={v => set("introP2", v)} multiline />

      {/* ── PROGRAM ── */}
      <SectionTitle>Program Section</SectionTitle>
      <F label="Program Title" value={data.programTitle} onChange={v => set("programTitle", v)} placeholder="Four Phases to Mastery" />

      <p className="text-xs text-white-muted font-body mb-2 mt-4">Phases</p>
      {(data.phases || []).map((phase, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={phase.number} onChange={e => {
              const arr = [...(data.phases || [])];
              arr[i] = { ...arr[i], number: e.target.value };
              set("phases", arr);
            }} placeholder="01"
              className="w-14 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red text-center" />
            <input value={phase.title} onChange={e => {
              const arr = [...(data.phases || [])];
              arr[i] = { ...arr[i], title: e.target.value };
              set("phases", arr);
            }} placeholder="Phase title"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => set("phases", (data.phases || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={phase.description} onChange={e => {
            const arr = [...(data.phases || [])];
            arr[i] = { ...arr[i], description: e.target.value };
            set("phases", arr);
          }} rows={2} placeholder="Phase description"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
      <button
        onClick={() => set("phases", [...(data.phases || []), { number: String((data.phases || []).length + 1).padStart(2, "0"), title: "", description: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-2">
        <Plus className="w-4 h-4" /> Add phase
      </button>

      <p className="text-xs text-white-muted font-body mb-2 mt-4">Extras</p>
      {(data.extras || []).map((item, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={item.title} onChange={e => {
              const arr = [...(data.extras || [])];
              arr[i] = { ...arr[i], title: e.target.value };
              set("extras", arr);
            }} placeholder="Extra title"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => set("extras", (data.extras || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={item.description} onChange={e => {
            const arr = [...(data.extras || [])];
            arr[i] = { ...arr[i], description: e.target.value };
            set("extras", arr);
          }} rows={2} placeholder="Extra description"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
      <button
        onClick={() => set("extras", [...(data.extras || []), { title: "", description: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-2">
        <Plus className="w-4 h-4" /> Add extra
      </button>

      {/* ── CTA ── */}
      <SectionTitle>CTA Section</SectionTitle>
      <F label="CTA Title" value={data.ctaTitle} onChange={v => set("ctaTitle", v)} placeholder="Be the First to Get Access" />
      <F label="Description — Text Before Highlight" value={data.ctaDesc1Before} onChange={v => set("ctaDesc1Before", v)} />
      <F label="Description — Highlight (colored)" value={data.ctaDesc1Highlight} onChange={v => set("ctaDesc1Highlight", v)} />
      <F label="Description — Text After Highlight" value={data.ctaDesc1After} onChange={v => set("ctaDesc1After", v)} />
      <F label="Description — Line 2" value={data.ctaDesc2} onChange={v => set("ctaDesc2", v)} multiline />
      <F label="Button Text" value={data.ctaButtonText} onChange={v => set("ctaButtonText", v)} placeholder="Claim 25% Off" />
      <F label="Button Link" value={data.ctaButtonLink} onChange={v => set("ctaButtonLink", v)} placeholder="#" />

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