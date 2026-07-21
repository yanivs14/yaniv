import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Save, Loader2, AlertCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";

const SECTIONS = [
  { key: "gate", label: "Email Gate" },
  { key: "video", label: "Video" },
];

function UploadButton({ onUpload, accept = "image/*", label = "Upload" }) {
  const [loading, setLoading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUpload(file_url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
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

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white-muted mb-1.5 font-body">{label}</label>
      {multiline ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body resize-none focus:outline-none focus:border-orange-red transition-colors" />
      ) : (
        <input value={value || ""} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
      )}
    </div>
  );
}

function MediaField({ label, value, onChange, isVideo = false }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white-muted mb-1.5 font-body">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste URL..."
          className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
        <UploadButton accept={isVideo ? "video/*" : "image/*"} label={isVideo ? "Video" : "Image"} onUpload={onChange} />
      </div>
      {value && !isVideo && <img src={value} alt="" className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]" />}
      {value && isVideo && <video src={value} className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]" muted />}
    </div>
  );
}

function SectionEditor({ sectionKey, content, update }) {
  if (!content) return null;
  const data = content[sectionKey];
  if (!data) return null;

  const f = (key, label, multiline = false) => (
    <Field key={key} label={label} value={data[key]} onChange={(v) => update(sectionKey, key, v)} multiline={multiline} />
  );
  const m = (key, label, isVideo = false) => (
    <MediaField key={key} label={label} value={data[key]} onChange={(v) => update(sectionKey, key, v)} isVideo={isVideo} />
  );

  if (sectionKey === "gate") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subheadline", "Subheadline", true)}
        {f("ctaText", "CTA Button Text")}
        {f("footnote", "Footnote")}
      </div>
    );
  }

  if (sectionKey === "video") {
    return (
      <div>
        {f("title", "Video Title")}
        {f("description", "Description (shown below the title)", true)}
        {m("videoUrl", "Video File (upload from computer)", true)}
        {m("posterUrl", "Poster Image (shown before play)")}
        <div className="mb-4">
          <label className="block text-xs text-white-muted mb-1.5 font-body">Poster Aspect Ratio</label>
          <div className="flex gap-2">
            {["horizontal", "vertical"].map((opt) => (
              <button key={opt} onClick={() => update(sectionKey, "posterAspect", opt)}
                className={`px-4 py-2 rounded-lg text-sm font-body transition-colors capitalize ${data.posterAspect === opt ? "bg-orange-red/10 text-orange-red border border-orange-red/30" : "bg-[#111] border border-[#2a2a2a] text-white-muted hover:text-off-white"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function GiftEditor() {
  const [content, setContent] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [activeSection, setActiveSection] = useState("gate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "gift" });
        if (pages.length > 0 && pages[0].data) {
          setRecordId(pages[0].id);
          setContent({ ...defaultGiftContent, ...pages[0].data });
        } else {
          setContent(defaultGiftContent);
        }
      } catch (err) {
        setError(err.message);
        setContent(defaultGiftContent);
      }
    })();
  }, []);

  const update = useCallback((sectionKey, field, value) => {
    setContent((prev) => {
      if (!prev) return prev;
      return { ...prev, [sectionKey]: { ...prev[sectionKey], [field]: value } };
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (recordId) {
        await base44.entities.LandingPageContent.update(recordId, { data: content });
      } else {
        const res = await base44.entities.LandingPageContent.create({ page_key: "gift", data: content });
        setRecordId(res.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-48 flex-shrink-0">
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {SECTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveSection(key)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm rounded-lg transition-all font-body whitespace-nowrap ${activeSection === key ? "bg-orange-red/10 text-orange-red border border-orange-red/30" : "text-white-muted hover:text-off-white hover:bg-white/5 border border-transparent"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight">
            {SECTIONS.find((s) => s.key === activeSection)?.label}
          </h3>
          <a href="/gift" target="_blank" rel="noreferrer" className="text-xs text-orange-red underline underline-offset-4 hover:text-orange-red-hover transition-colors mr-4">
            Preview page →
          </a>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-orange-red text-dark-bg px-5 py-2.5 rounded-lg font-body text-sm font-semibold hover:bg-orange-red-hover transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400 font-body">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <SectionEditor sectionKey={activeSection} content={content} update={update} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}