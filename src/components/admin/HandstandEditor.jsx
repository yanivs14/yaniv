import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Save, Plus, Trash2, Loader2, AlertCircle, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { defaultHandstandContent } from "@/lib/handstandContent";

const SECTIONS = [
  { key: "texts", label: "Texts & CTAs" },
  { key: "hero", label: "Hero" },
  { key: "valueStrip", label: "Value Strip" },
  { key: "methodVideo", label: "Method Video" },
  { key: "problem", label: "Problem" },
  { key: "startFromLevel", label: "Start From Level" },
  { key: "curriculum", label: "Curriculum" },
  { key: "whatIsIncluded", label: "What Is Included" },
  { key: "instructor", label: "Instructor" },
  { key: "purchaseOptions", label: "Purchase Options" },
  { key: "faq", label: "FAQ" },
  { key: "finalCta", label: "Final CTA" },
  { key: "footer", label: "Footer" },
  { key: "settings", label: "Page Settings" },
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

function StringList({ items, onChange, label = "item" }) {
  return (
    <div>
      {items?.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={item} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a); }}
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...(items || []), `New ${label}`])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
        <Plus className="w-4 h-4" /> Add {label}
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
  // Helper for nested object fields (e.g. purchaseOptions.standalone.label)
  const nf = (objKey, key, label, multiline = false) => (
    <Field key={`${objKey}.${key}`} label={label} value={data[objKey]?.[key]} onChange={(v) => update(sectionKey, objKey, { ...data[objKey], [key]: v })} multiline={multiline} />
  );

  if (sectionKey === "texts") {
    return (
      <div>
        <p className="text-xs text-white-muted mb-2 font-body font-semibold">Primary CTA (auto-switches with deadline)</p>
        {f("ctaPreLaunch", "CTA Text — Pre-Launch")}
        {f("ctaRegular", "CTA Text — After Deadline")}
        {f("secondaryCtaText", "Secondary CTA Text")}
        {f("microcopy", "Microcopy (under CTAs)", true)}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Offer Labels</p>
        {f("offerLabelPreLaunch", "Offer Label — Pre-Launch")}
        {f("offerLabelRegular", "Offer Label — After Deadline")}
        {f("preLaunchLabel", "Pre-Launch Badge Text")}
        {f("deliveryNotePreLaunch", "Delivery Note — Pre-Launch")}
        {f("deliveryNoteRegular", "Delivery Note — After Deadline")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Announcement Bar</p>
        {f("announcementLeftText", "Left Text — Pre-Launch")}
        {f("announcementRightText", "Right Text — Pre-Launch")}
        {f("announcementCtaText", "CTA Text")}
        {f("announcementNowAvailable", "Left Text — After Deadline")}
        {f("announcementOneTimePayment", "Right Text — After Deadline")}
        {f("announcementCountdownLabel", "Countdown Label")}
        {f("announcementMobileEndsLabel", "Mobile 'Ends' Label")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Hero</p>
        {f("heroCountdownLabel", "Countdown Label")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Sticky Mobile Bar</p>
        {f("stickyBarPreLaunch", "Left Text — Pre-Launch")}
        {f("stickyBarRegular", "Left Text — After Deadline")}
        {f("stickyBarCtaText", "Button Text")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Purchase Options</p>
        {f("standalonePriceNotePreLaunch", "Standalone Price Note — Pre-Launch")}
        {f("standalonePriceNoteRegular", "Standalone Price Note — After Deadline")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Final CTA</p>
        {f("finalCtaPreLaunchReminder", "Pre-Launch Reminder")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Footer Links</p>
        {f("footerTerms", "Terms Link")}
        {f("footerPrivacy", "Privacy Link")}
        {f("footerRefund", "Refund Link")}
        {f("footerContact", "Contact Link")}

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Video</p>
        {f("videoPlaceholder", "Placeholder Text (when no video)")}
      </div>
    );
  }

  if (sectionKey === "hero") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("preLaunchLabel", "Pre-Launch Label (badge)")}
        {f("headline1", "Headline Line 1")}
        {f("headline2", "Headline Line 2 (accent)")}
        {f("supporting", "Supporting Copy", true)}
        {f("outcomeLine", "Outcome Line")}
        {m("imageUrl", "Background Image")}
      </div>
    );
  }

  if (sectionKey === "valueStrip") {
    return (
      <div>
        <p className="text-xs text-white-muted mb-2 font-body font-semibold">Value Items</p>
        <StringList items={data.items} onChange={(v) => update(sectionKey, "items", v)} label="item" />
      </div>
    );
  }

  if (sectionKey === "methodVideo") {
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
        {f("subtitle", "Subtitle", true)}
        {f("conclusion", "Conclusion", true)}
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

  if (sectionKey === "startFromLevel") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle", true)}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Cards</p>
        {data.cards?.map((card, i) => (
          <ArrayItem key={i} index={i} label="Card" onRemove={() => update(sectionKey, "cards", data.cards.filter((_, idx) => idx !== i))}>
            <Field label="Title" value={card.title} onChange={(v) => { const a = [...data.cards]; a[i] = { ...a[i], title: v }; update(sectionKey, "cards", a); }} />
            <p className="text-xs text-white-dim mb-1 mt-2 font-body">Bullets</p>
            {card.bullets?.map((b, j) => (
              <div key={j} className="flex gap-2 mb-2">
                <input value={b} onChange={(e) => { const cards = [...data.cards]; const bullets = [...cards[i].bullets]; bullets[j] = e.target.value; cards[i] = { ...cards[i], bullets }; update(sectionKey, "cards", cards); }}
                  className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
                <button onClick={() => { const cards = [...data.cards]; cards[i] = { ...cards[i], bullets: cards[i].bullets.filter((_, idx) => idx !== j) }; update(sectionKey, "cards", cards); }}
                  className="text-white-muted hover:text-red-400 transition-colors p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => { const cards = [...data.cards]; cards[i] = { ...cards[i], bullets: [...(cards[i].bullets || []), "New bullet"] }; update(sectionKey, "cards", cards); }}
              className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
              <Plus className="w-4 h-4" /> Add bullet
            </button>
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "cards", [...(data.cards || []), { title: "New Card", bullets: [] }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add card
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
        {f("callout", "Callout (after roadmap)", true)}
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

  if (sectionKey === "whatIsIncluded") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Items</p>
        <StringList items={data.items} onChange={(v) => update(sectionKey, "items", v)} label="item" />
      </div>
    );
  }

  if (sectionKey === "instructor") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("bio", "Bio", true)}
        {m("imageUrl", "Instructor Image")}
      </div>
    );
  }

  if (sectionKey === "purchaseOptions") {
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("subtitle", "Subtitle", true)}
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Standalone Course</p>
        {nf("standalone", "label", "Label")}
        {nf("standalone", "title", "Title")}
        {nf("standalone", "microcopy", "Microcopy")}
        <p className="text-xs text-white-dim mb-1 mt-2 font-body">Features</p>
        <StringList items={data.standalone?.features} onChange={(v) => update(sectionKey, "standalone", { ...data.standalone, features: v })} label="feature" />
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Annual Membership</p>
        {nf("annual", "eyebrow", "Eyebrow")}
        {nf("annual", "title", "Title")}
        {nf("annual", "priceMonthly", "Price (monthly)")}
        {nf("annual", "priceNote", "Price Note")}
        {nf("annual", "valueStatement", "Value Statement", true)}
        {nf("annual", "ctaText", "CTA Text")}
        {nf("annual", "disclosure", "Disclosure", true)}
        {nf("annual", "badge", "Badge")}
        <p className="text-xs text-white-dim mb-1 mt-2 font-body">Features</p>
        <StringList items={data.annual?.features} onChange={(v) => update(sectionKey, "annual", { ...data.annual, features: v })} label="feature" />
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
            <Field label="Answer (pre-launch)" value={item.a} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], a: v }; update(sectionKey, "items", a); }} multiline />
            <Field label="Answer (after Aug 3, optional)" value={item.aPost} onChange={(v) => { const a = [...data.items]; a[i] = { ...a[i], aPost: v }; update(sectionKey, "items", a); }} multiline />
          </ArrayItem>
        ))}
        <button onClick={() => update(sectionKey, "items", [...(data.items || []), { q: "New question", a: "Answer" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add FAQ item
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
        {f("microcopy", "Microcopy")}
      </div>
    );
  }

  if (sectionKey === "footer") {
    return (
      <div>
        {f("brand", "Brand Name")}
        {f("copyright", "Copyright")}
      </div>
    );
  }

  if (sectionKey === "settings") {
    return (
      <div>
        <div className="mb-4">
          <label className="block text-xs text-white-muted mb-1.5 font-body">Accent Color (replaces turquoise in all headings)</label>
          <div className="flex items-center gap-3">
            <input type="color" value={data.accentColor || "#00fff7"} onChange={(e) => update(sectionKey, "accentColor", e.target.value)} className="w-12 h-10 rounded-lg border border-[#2a2a2a] bg-transparent cursor-pointer p-0.5" />
            <input value={data.accentColor || ""} onChange={(e) => update(sectionKey, "accentColor", e.target.value)} placeholder="Leave empty for default turquoise" className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
            {data.accentColor && (
              <button onClick={() => update(sectionKey, "accentColor", "")} className="text-xs text-white-muted hover:text-red-400 transition-colors whitespace-nowrap">Reset</button>
            )}
          </div>
          <p className="text-[11px] text-white-dim mt-2 font-body">Applies globally to every accent element on this page — buttons, eyebrow text, play button, checkmarks, badges, borders, and heading highlights.</p>
        </div>
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
          const dbData = pages[0].data;
          const merged = {};
          for (const key of Object.keys(defaultHandstandContent)) {
            const defVal = defaultHandstandContent[key];
            const dbVal = dbData[key];
            if (dbVal && typeof defVal === "object" && !Array.isArray(defVal) && typeof dbVal === "object" && !Array.isArray(dbVal)) {
              merged[key] = { ...defVal, ...dbVal };
            } else {
              merged[key] = dbVal !== undefined ? dbVal : defVal;
            }
          }
          setContent(merged);
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