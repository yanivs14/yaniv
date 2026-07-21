import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Save, Plus, Trash2, Loader2, AlertCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultHandstandContent } from "@/lib/handstandContent";

const SECTIONS = [
  { key: "navbar", label: "Navbar" },
  { key: "hero", label: "Hero" },
  { key: "showcase", label: "Video Showcase" },
  { key: "whatYouGet", label: "What You Get" },
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "curriculum", label: "Curriculum" },
  { key: "instructor", label: "Instructor" },
  { key: "testimonials", label: "Testimonials" },
  { key: "pricing", label: "Pricing" },
  { key: "faq", label: "FAQ" },
  { key: "finalCta", label: "Final CTA" },
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

function ArrayItem({ index, onRemove, children, label }) {
  return (
    <div className="mb-4 border border-[#2a2a2a] rounded-xl p-4 bg-[#111]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-body font-semibold text-white-muted uppercase tracking-wider">{label} {index + 1}</span>
        <button onClick={onRemove} className="text-white-muted hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {children}
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

  if (sectionKey === "navbar") {
    return <div>{f("brandName", "Brand Name")}{f("navCtaText", "Nav CTA Text")}</div>;
  }

  if (sectionKey === "hero") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline1", "Headline Line 1")}
        {f("headline2", "Headline Line 2")}
        {f("headlineAccent", "Accent Word")}
        {f("boldDescription", "Bold Description")}
        {f("subheadline", "Subheadline", true)}
        {f("ctaText", "CTA Button Text")}
        {f("ctaSubtext", "CTA Subtext")}
        {m("imageUrl", "Background Image")}
      </div>
    );
  }

  if (sectionKey === "showcase") {
    return (
      <div>
        {f("headline", "Headline")}
        {f("subheadline", "Subheadline", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Video</p>
        {m("youtubeUrl", "YouTube URL (overrides uploaded video)")}
        {m("videoUrl", "Uploaded Video File", true)}
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

  if (sectionKey === "problem") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Problem Cards</p>
        {data.points?.map((p, i) => (
          <ArrayItem key={i} index={i} label="Card" onRemove={() => update(sectionKey, "points", data.points.filter((_, idx) => idx !== i))}>
            <Field label="Title" value={p.title} onChange={(v) => { const a = [...data.points]; a[i] = { ...a[i], title: v }; update(sectionKey, "points", a); }} />
            <Field label="Description" value={p.desc} onChange={(v) => { const a = [...data.points]; a[i] = { ...a[i], desc: v }; update(sectionKey, "points", a); }} multiline />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "points", [...(data.points || []), { title: "New Card", desc: "Description" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add card
        </button>
      </div>
    );
  }

  if (sectionKey === "solution") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Media</p>
        {m("imageUrl", "Section Image")}
        {m("videoUrl", "Section Video (overrides image)", true)}
        {f("videoLabel", "Video Label (e.g. Watch the method)")}
        {f("videoDuration", "Video Duration (e.g. 2:14)")}
        {f("statValue", "Floating Stat Value (e.g. 8wks)")}
        {f("statLabel", "Floating Stat Label (e.g. to wall-free)")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Benefits</p>
        {data.benefits?.map((b, i) => (
          <ArrayItem key={i} index={i} label="Benefit" onRemove={() => update(sectionKey, "benefits", data.benefits.filter((_, idx) => idx !== i))}>
            <Field label="Title" value={b.title} onChange={(v) => { const a = [...data.benefits]; a[i] = { ...a[i], title: v }; update(sectionKey, "benefits", a); }} />
            <Field label="Description" value={b.desc} onChange={(v) => { const a = [...data.benefits]; a[i] = { ...a[i], desc: v }; update(sectionKey, "benefits", a); }} multiline />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "benefits", [...(data.benefits || []), { title: "New Benefit", desc: "Description" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add benefit
        </button>
      </div>
    );
  }

  if (sectionKey === "curriculum") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Modules</p>
        {data.modules?.map((mod, i) => (
          <ArrayItem key={i} index={i} label="Module" onRemove={() => update(sectionKey, "modules", data.modules.filter((_, idx) => idx !== i))}>
            <Field label="Week Label" value={mod.week} onChange={(v) => { const a = [...data.modules]; a[i] = { ...a[i], week: v }; update(sectionKey, "modules", a); }} />
            <Field label="Title" value={mod.title} onChange={(v) => { const a = [...data.modules]; a[i] = { ...a[i], title: v }; update(sectionKey, "modules", a); }} />
            <Field label="Description" value={mod.desc} onChange={(v) => { const a = [...data.modules]; a[i] = { ...a[i], desc: v }; update(sectionKey, "modules", a); }} multiline />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "modules", [...(data.modules || []), { week: "Week X", title: "New Module", desc: "Description" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add module
        </button>
      </div>
    );
  }

  if (sectionKey === "instructor") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("name", "Name")}
        {f("title", "Title")}
        {f("bio", "Bio", true)}
        {m("imageUrl", "Instructor Image")}
      </div>
    );
  }

  if (sectionKey === "testimonials") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline1", "Headline (first line)")}
        {f("headlineAccent", "Headline Accent (highlighted in teal)")}
        {f("subtitle", "Subtitle", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Testimonials</p>
        {data.items?.map((t, i) => (
          <ArrayItem key={i} index={i} label="Testimonial" onRemove={() => update(sectionKey, "items", data.items.filter((_, idx) => idx !== i))}>
            <Field label="Name" value={t.name} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], name: v }; update(sectionKey, "items", a); }} />
            <Field label="Role" value={t.role} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], role: v }; update(sectionKey, "items", a); }} />
            <Field label="Quote" value={t.quote} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], quote: v }; update(sectionKey, "items", a); }} multiline />
            <MediaField label="Photo" value={t.img} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], img: v }; update(sectionKey, "items", a); }} />
            <MediaField label="Video (optional)" value={t.videoUrl} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], videoUrl: v }; update(sectionKey, "items", a); }} isVideo />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "items", [...(data.items || []), { name: "", role: "", quote: "", img: "", videoUrl: "" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add testimonial
        </button>
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Social Stats</p>
        {data.stats?.map((s, i) => (
          <ArrayItem key={i} index={i} label="Stat" onRemove={() => update(sectionKey, "stats", data.stats.filter((_, idx) => idx !== i))}>
            <Field label="Value" value={s.value} onChange={(v) => { const a = [...data.stats]; a[i] = { ...a[i], value: v }; update(sectionKey, "stats", a); }} />
            <Field label="Label" value={s.label} onChange={(v) => { const a = [...data.stats]; a[i] = { ...a[i], label: v }; update(sectionKey, "stats", a); }} />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "stats", [...(data.stats || []), { value: "", label: "" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add stat
        </button>
      </div>
    );
  }

  if (sectionKey === "pricing") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("lockInTitle", "Lock-In Title")}
        {f("lockInSubtitle", "Lock-In Subtitle")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle")}
        {f("price", "Price")}
        {f("priceNote", "Price Note")}
        {f("badge", "Badge")}
        {f("ctaText", "CTA Button Text")}
        {f("guarantee", "Guarantee Text")}
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Annual Membership Card</p>
        {f("annualCardTitle", "Annual Card Title")}
        {f("annualCardTitleAccent", "Annual Card Title Accent (teal)")}
        {f("annualCardDescription", "Annual Card Description", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Features</p>
        {data.features?.map((feat, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={feat} onChange={(e) => { const a = [...data.features]; a[i] = e.target.value; update(sectionKey, "features", a); }}
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => update(sectionKey, "features", data.features.filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => update(sectionKey, "features", [...(data.features || []), "New feature"])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add feature
        </button>
      </div>
    );
  }

  if (sectionKey === "faq") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">FAQ Items</p>
        {data.items?.map((item, i) => (
          <ArrayItem key={i} index={i} label="FAQ" onRemove={() => update(sectionKey, "items", data.items.filter((_, idx) => idx !== i))}>
            <Field label="Question" value={item.q} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], q: v }; update(sectionKey, "items", a); }} />
            <Field label="Answer" value={item.a} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], a: v }; update(sectionKey, "items", a); }} multiline />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "items", [...(data.items || []), { q: "New question", a: "Answer" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add FAQ item
        </button>
      </div>
    );
  }

  if (sectionKey === "whatYouGet") {
    return (
      <div>
        {f("headline", "Headline")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Items</p>
        {data.items?.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={item} onChange={(e) => { const a = [...data.items]; a[i] = e.target.value; update(sectionKey, "items", a); }}
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => update(sectionKey, "items", data.items.filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => update(sectionKey, "items", [...(data.items || []), "New item"])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add item
        </button>
      </div>
    );
  }

  if (sectionKey === "finalCta") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle", true)}
        {f("ctaText", "CTA Button Text")}
        {f("priceNote", "Price Note")}
      </div>
    );
  }

  return null;
}

export default function HandstandEditor() {
  const [content, setContent] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const pages = await base44.entities.LandingPageContent.filter({ page_key: "handstand_course" });
        if (pages.length > 0 && pages[0].data) {
          setRecordId(pages[0].id);
          setContent({ ...defaultHandstandContent, ...pages[0].data });
        } else {
          setContent(defaultHandstandContent);
        }
      } catch (err) {
        setError(err.message);
        setContent(defaultHandstandContent);
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
        const res = await base44.entities.LandingPageContent.create({ page_key: "handstand_course", data: content });
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
      {/* Section nav */}
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

      {/* Editor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-xl font-bold text-off-white uppercase tracking-tight">
            {SECTIONS.find((s) => s.key === activeSection)?.label}
          </h3>
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