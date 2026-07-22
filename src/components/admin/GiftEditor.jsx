import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Save, Plus, Trash2, Loader2, AlertCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultGiftContent } from "@/lib/giftContent";

const SECTIONS = [
  { key: "gate", label: "Email Gate" },
  { key: "header", label: "Header" },
  { key: "hero", label: "Access Hero" },
  { key: "introVideo", label: "Intro Video" },
  { key: "prep", label: "Prep Info" },
  { key: "practice", label: "Practice Video" },
  { key: "closing", label: "Closing Video" },
  { key: "bridge", label: "Bridge" },
  { key: "primaryTestimonial", label: "Primary Testimonial" },
  { key: "membership", label: "Membership" },
  { key: "testimonials", label: "More Testimonials" },
  { key: "faq", label: "FAQ" },
  { key: "final", label: "Final CTA" },
  { key: "stickyBar", label: "Sticky Bar" },
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

function StringList({ items, onChange, addLabel }) {
  return (
    <div>
      {(items || []).map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={item} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a); }}
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
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
          {fields.map((fld) => {
            if (fld.media) {
              return <MediaField key={fld.key} label={fld.label} value={item[fld.key]} isVideo={fld.isVideo}
                onChange={(v) => { const a = [...items]; a[i] = { ...a[i], [fld.key]: v }; onChange(a); }} />;
            }
            return <Field key={fld.key} label={fld.label} value={item[fld.key]} multiline={fld.multiline}
              onChange={(v) => { const a = [...items]; a[i] = { ...a[i], [fld.key]: v }; onChange(a); }} />;
          })}
        </div>
      ))}
      <button onClick={() => onChange([...(items || []), fields.reduce((o, f) => ({ ...o, [f.key]: "" }), {})])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-1">
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">{children}</p>;
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
  const sf = (sub, key, label, multiline = false) => (
    <Field key={`${sub}.${key}`} label={label} value={data[sub]?.[key]} onChange={(v) => update(sectionKey, sub, { ...data[sub], [key]: v })} multiline={multiline} />
  );

  switch (sectionKey) {
    case "gate":
      return (
        <div>
          {f("eyebrow", "Eyebrow")}
          {f("headline", "Headline")}
          {f("subheadline", "Subheadline", true)}
          {f("benefitLine", "Benefit Line")}
          {f("emailPlaceholder", "Email Placeholder")}
          {f("ctaText", "CTA Button Text")}
          {f("microcopy", "Microcopy (under button)")}
          {f("marketingLabel", "Marketing Checkbox Label", true)}
          <SectionLabel>Gate Image</SectionLabel>
          {m("gateImage", "Gate Image (optional)")}
        </div>
      );
    case "header":
      return <div>{f("brand", "Brand Name")}{f("ctaText", "Header CTA Text")}</div>;
    case "hero":
      return (
        <div>
          {f("eyebrow", "Eyebrow")}
          {f("headline", "Headline")}
          {f("supporting", "Supporting Text", true)}
          {f("primaryCta", "Primary CTA")}
          {f("secondaryCta", "Secondary CTA")}
        </div>
      );
    case "introVideo":
      return (
        <div>
          {f("headline", "Heading")}
          {f("thumbnailLabel", "Thumbnail Label")}
          {f("duration", "Duration Label")}
          <SectionLabel>Video</SectionLabel>
          {m("youtubeUrl", "YouTube URL (optional)")}
          {m("videoUrl", "Uploaded Video File", true)}
          {m("poster", "Poster / Thumbnail")}
        </div>
      );
    case "prep":
      return (
        <div>
          <SectionLabel>Prep Items</SectionLabel>
          <ObjectList items={data.items} onChange={(v) => update(sectionKey, "items", v)} addLabel="Add item"
            fields={[{ key: "title", label: "Title" }, { key: "desc", label: "Description", multiline: true }]} />
        </div>
      );
    case "practice":
      return (
        <div>
          {f("eyebrow", "Eyebrow")}
          {f("headline", "Headline")}
          {f("supporting", "Supporting Text", true)}
          {f("thumbnailLabel", "Thumbnail Label")}
          {f("thumbnailSub", "Thumbnail Sub-label")}
          {f("duration", "Duration Label")}
          <SectionLabel>Video</SectionLabel>
          {m("youtubeUrl", "YouTube URL (optional)")}
          {m("videoUrl", "Uploaded Video File", true)}
          {m("poster", "Poster / Thumbnail")}
        </div>
      );
    case "closing":
      return (
        <div>
          {f("headline", "Headline")}
          {f("supporting", "Supporting Text", true)}
          {f("ctaText", "CTA Button Text")}
          <SectionLabel>Video</SectionLabel>
          {m("youtubeUrl", "YouTube URL (optional)")}
          {m("videoUrl", "Uploaded Video File", true)}
          {m("poster", "Poster / Thumbnail")}
        </div>
      );
    case "bridge":
      return (
        <div>
          {f("eyebrow", "Eyebrow")}
          {f("headline", "Headline")}
          {f("copy", "Copy", true)}
          {f("ctaText", "CTA Button Text")}
          <SectionLabel>Benefit Cards</SectionLabel>
          <ObjectList items={data.cards} onChange={(v) => update(sectionKey, "cards", v)} addLabel="Add card"
            fields={[{ key: "title", label: "Title" }, { key: "desc", label: "Description", multiline: true }]} />
        </div>
      );
    case "primaryTestimonial":
      return (
        <div>
          {f("quote", "Quote", true)}
          {f("name", "Name")}
          {f("context", "Context")}
          {m("img", "Photo (optional)")}
        </div>
      );
    case "membership":
      return (
        <div>
          <SectionLabel>Annual Membership</SectionLabel>
          {sf("annual", "badge", "Badge")}
          {sf("annual", "title", "Title")}
          {sf("annual", "price", "Price (e.g. $20)")}
          {sf("annual", "period", "Period (e.g. / month)")}
          {sf("annual", "billingNote", "Billing Note")}
          {sf("annual", "description", "Description", true)}
          {sf("annual", "cta", "CTA Button Text")}
          {sf("annual", "microcopy", "Microcopy")}
          <p className="text-xs text-white-dim mb-2 font-body">Annual Benefits</p>
          <StringList items={data.annual?.benefits} onChange={(v) => update(sectionKey, "annual", { ...data.annual, benefits: v })} addLabel="Add benefit" />
          <SectionLabel>Monthly Membership</SectionLabel>
          {sf("monthly", "title", "Title")}
          {sf("monthly", "price", "Price (e.g. $35)")}
          {sf("monthly", "period", "Period (e.g. / month)")}
          {sf("monthly", "billingNote", "Billing Note")}
          {sf("monthly", "description", "Description", true)}
          {sf("monthly", "cta", "CTA Button Text")}
          {sf("monthly", "microcopy", "Microcopy")}
          <p className="text-xs text-white-dim mb-2 font-body">Monthly Benefits</p>
          <StringList items={data.monthly?.benefits} onChange={(v) => update(sectionKey, "monthly", { ...data.monthly, benefits: v })} addLabel="Add benefit" />
        </div>
      );
    case "testimonials":
      return (
        <div>
          {f("heading", "Heading")}
          <SectionLabel>Testimonials</SectionLabel>
          <ObjectList items={data.items} onChange={(v) => update(sectionKey, "items", v)} addLabel="Add testimonial"
            fields={[
              { key: "quote", label: "Quote", multiline: true },
              { key: "name", label: "Name" },
              { key: "context", label: "Context" },
              { key: "img", label: "Photo", media: true },
            ]} />
        </div>
      );
    case "faq":
      return (
        <div>
          {f("heading", "Heading")}
          <SectionLabel>FAQ Items</SectionLabel>
          <ObjectList items={data.items} onChange={(v) => update(sectionKey, "items", v)} addLabel="Add FAQ"
            fields={[{ key: "q", label: "Question" }, { key: "a", label: "Answer", multiline: true }]} />
        </div>
      );
    case "final":
      return (
        <div>
          {f("headline", "Headline")}
          {f("copy", "Copy", true)}
          {f("primaryCta", "Primary CTA (Annual)")}
          {f("secondaryCta", "Secondary CTA (Monthly)")}
          {f("returnLink", "Return Link Text")}
        </div>
      );
    case "stickyBar":
      return (
        <div>
          {f("label", "Label")}
          {f("price", "Price Text")}
          {f("ctaText", "CTA Button Text")}
        </div>
      );
    case "footer":
      return <div>{f("brand", "Brand Name")}{f("copyright", "Copyright (use {year} for year)")}</div>;
    default:
      return null;
  }
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
          const dbData = pages[0].data;
          const merged = {};
          for (const key of Object.keys(defaultGiftContent)) {
            const defVal = defaultGiftContent[key];
            const dbVal = dbData[key];
            if (dbVal && typeof defVal === "object" && !Array.isArray(defVal) && typeof dbVal === "object" && !Array.isArray(dbVal)) {
              merged[key] = deepMerge(defVal, dbVal);
            } else {
              merged[key] = dbVal !== undefined ? dbVal : defVal;
            }
          }
          setContent(merged);
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
      <div className="lg:w-52 flex-shrink-0">
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

function deepMerge(def, override) {
  if (Array.isArray(def)) return override !== undefined ? override : def;
  const result = { ...def };
  if (override && typeof override === "object") {
    for (const key of Object.keys(override)) {
      if (def[key] && typeof def[key] === "object" && !Array.isArray(def[key]) && override[key] && typeof override[key] === "object") {
        result[key] = deepMerge(def[key], override[key]);
      } else {
        result[key] = override[key];
      }
    }
  }
  return result;
}