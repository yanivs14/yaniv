import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Save, Plus, Trash2, Loader2, AlertCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";

const SECTIONS = [
  { key: "gate", label: "Email Gate" },
  { key: "header", label: "Header" },
  { key: "stage1", label: "1 · Intro" },
  { key: "stage2", label: "2 · Practice" },
  { key: "stage3", label: "3 · Bridge" },
  { key: "stage4", label: "4 · Membership" },
  { key: "stage5", label: "5 · Proof & FAQ" },
  { key: "footer", label: "Footer" },
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

function StringList({ items, onChange, addLabel, multiline }) {
  return (
    <div>
      {(items || []).map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          {multiline ? (
            <textarea value={item} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a); }} rows={2}
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
          ) : (
            <input value={item} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a); }}
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          )}
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...(items || []), ""])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-1">
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}

function ObjectList({ items, onChange, addLabel, fields }) {
  return (
    <div>
      {(items || []).map((item, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-body text-white-dim">#{i + 1}</span>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {fields.map((fld) => (
            <Field key={fld.key} label={fld.label} value={item[fld.key]} multiline={fld.multiline}
              onChange={(v) => { const a = [...items]; a[i] = { ...a[i], [fld.key]: v }; onChange(a); }} />
          ))}
        </div>
      ))}
      <button onClick={() => onChange([...(items || []), fields.reduce((o, f) => ({ ...o, [f.key]: "" }), {})])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-1">
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
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
  // helper to update a nested sub-object (e.g. stage4.annual)
  const sf = (sub, key, label, multiline = false) => (
    <Field key={`${sub}.${key}`} label={label} value={data[sub]?.[key]} onChange={(v) => update(sectionKey, sub, { ...data[sub], [key]: v })} multiline={multiline} />
  );

  if (sectionKey === "gate") {
    return <div>{f("eyebrow", "Eyebrow")}{f("headline", "Headline")}{f("subheadline", "Subheadline", true)}{f("ctaText", "CTA Button Text")}{f("footnote", "Footnote")}</div>;
  }
  if (sectionKey === "header") {
    return <div>{f("brand", "Brand Name")}{f("ctaText", "Header CTA Text")}</div>;
  }
  if (sectionKey === "stage1") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("supporting", "Supporting Text", true)}
        {f("primaryCta", "Primary CTA")}
        {f("secondaryCta", "Secondary CTA")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Intro Video</p>
        {m("introYoutubeUrl", "YouTube URL (optional)")}
        {m("introVideoUrl", "Uploaded Video File", true)}
        {m("introPoster", "Poster / Thumbnail")}
        {f("beforeHeading", "Before-You-Begin Heading")}
        {f("beforeNote", "Before-You-Begin Note", true)}
      </div>
    );
  }
  if (sectionKey === "stage2") {
    return (
      <div>
        {f("heading", "Heading")}
        {f("supporting", "Supporting Text", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Instructions</p>
        <ObjectList items={data.instructions} onChange={(v) => update(sectionKey, "instructions", v)} addLabel="Add instruction"
          fields={[{ key: "title", label: "Title" }, { key: "desc", label: "Description", multiline: true }]} />
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Practice Video</p>
        {m("practiceYoutubeUrl", "YouTube URL (optional)")}
        {m("practiceVideoUrl", "Uploaded Video File", true)}
        {m("practicePoster", "Poster / Thumbnail")}
        {f("feedbackHeading", "Feedback Heading")}
        {f("completeBtn", "Complete Button Text")}
        {f("laterBtn", "Later Button Text")}
        {f("completeMessage", "Complete Message", true)}
        {f("laterMessage", "Later Message", true)}
      </div>
    );
  }
  if (sectionKey === "stage3") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("copy", "Copy", true)}
        {f("ctaText", "CTA Button Text")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Benefits</p>
        <ObjectList items={data.benefits} onChange={(v) => update(sectionKey, "benefits", v)} addLabel="Add benefit"
          fields={[{ key: "title", label: "Title" }, { key: "desc", label: "Description", multiline: true }]} />
      </div>
    );
  }
  if (sectionKey === "stage4") {
    return (
      <div>
        {f("heading", "Section Heading")}
        {f("supporting", "Supporting Text", true)}
        {f("noteLine", "Note Line (under both cards)", true)}
        {f("handstandLine", "Handstand Highlight Line")}
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Annual Membership</p>
        {sf("annual", "badge", "Badge")}
        {sf("annual", "title", "Title")}
        {sf("annual", "price", "Price (e.g. $20)")}
        {sf("annual", "period", "Period (e.g. / month)")}
        {sf("annual", "billingNote", "Billing Note")}
        {sf("annual", "cta", "CTA Button Text")}
        <p className="text-xs text-white-dim mb-2 font-body">Annual Benefits</p>
        <StringList items={data.annual?.benefits} onChange={(v) => update(sectionKey, "annual", { ...data.annual, benefits: v })} addLabel="Add benefit" />
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Monthly Membership</p>
        {sf("monthly", "title", "Title")}
        {sf("monthly", "price", "Price (e.g. $35)")}
        {sf("monthly", "period", "Period (e.g. / month)")}
        {sf("monthly", "cancelNote", "Cancel Note")}
        {sf("monthly", "cta", "CTA Button Text")}
        <p className="text-xs text-white-dim mb-2 font-body">Monthly Benefits</p>
        <StringList items={data.monthly?.benefits} onChange={(v) => update(sectionKey, "monthly", { ...data.monthly, benefits: v })} addLabel="Add benefit" />
      </div>
    );
  }
  if (sectionKey === "stage5") {
    return (
      <div>
        {f("testimonialsHeading", "Testimonials Heading")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Testimonials</p>
        <ObjectList items={data.testimonials} onChange={(v) => update(sectionKey, "testimonials", v)} addLabel="Add testimonial"
          fields={[{ key: "quote", label: "Quote", multiline: true }, { key: "name", label: "Name" }, { key: "img", label: "Photo URL" }]} />
        {f("faqHeading", "FAQ Heading")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">FAQ Items</p>
        <ObjectList items={data.faqs} onChange={(v) => update(sectionKey, "faqs", v)} addLabel="Add FAQ"
          fields={[{ key: "q", label: "Question" }, { key: "a", label: "Answer", multiline: true }]} />
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Final CTA Block</p>
        {sf("final", "headline", "Headline")}
        {sf("final", "copy", "Copy", true)}
        {sf("final", "primaryCta", "Primary CTA (Annual)")}
        {sf("final", "secondaryCta", "Secondary CTA (Monthly)")}
        {sf("final", "tertiaryLink", "Tertiary Link Text")}
        {sf("final", "questionMessage", "Pre-filled Question Message")}
        {sf("final", "supportUrl", "Support / Instagram DM URL")}
      </div>
    );
  }
  if (sectionKey === "footer") {
    return <div>{f("brand", "Brand Name")}{f("copyright", "Copyright (use {year} for year)")}</div>;
  }
  return null;
}

export default function GiftEditor() {
  const [content, setContent] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [activeSection, setActiveSection] = useState("stage1");
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
        <div className="flex items-center justify-between mb-5 gap-3">
          <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight">
            {SECTIONS.find((s) => s.key === activeSection)?.label}
          </h3>
          <a href="/gift" target="_blank" rel="noreferrer" className="text-xs text-orange-red underline underline-offset-4 hover:text-orange-red-hover transition-colors">
            Preview →
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