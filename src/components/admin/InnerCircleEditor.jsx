import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Upload, Save } from "lucide-react";

const ICON_TAGS = ["Foundation", "Custom", "Live", "Adaptive", "Support", "Exclusive", "Strength", "Health", "Mindset", "Safety", "Results", "Energy", "Schedule", "Community", "Verified", "Premium", "Power"];
import { base44 } from "@/api/base44Client";
import { loadICContent, saveICContent, IC_DEFAULTS } from "@/lib/innerCircleContent";

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
  return <p className="text-xs text-white-muted font-body font-semibold uppercase tracking-wider mb-3 mt-5 border-t border-[#1e1e1e] pt-4">{children}</p>;
}

export default function InnerCircleEditor() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadICContent().then(setData);
  }, []);

  const set = useCallback((path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const setArr = useCallback((path, idx, field, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let arr = next;
      for (const k of keys) arr = arr[k];
      arr[idx][field] = value;
      return next;
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const saved_ = await saveICContent(data);
    setData(saved_);
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
      {/* Save button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-white-muted font-body">Edit all content for the Inner Circle page</p>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-orange-red text-dark-bg font-body text-xs font-bold px-4 py-2 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
          <Save className="w-3.5 h-3.5" />
          {saved ? "Saved ✓" : saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* ── NAVBAR ── */}
      <SectionTitle>Inner Circle Navbar</SectionTitle>
      <F label="CTA Button Text" value={data.navbar?.ctaText} onChange={v => set("navbar.ctaText", v)} />
      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Nav Links (anchor links to page sections)</p>
      {(data.navbar?.links || []).map((link, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={link.label} onChange={e => {
            const arr = JSON.parse(JSON.stringify(data.navbar?.links || []));
            arr[i].label = e.target.value;
            set("navbar.links", arr);
          }} placeholder="Label" className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <input value={link.href} onChange={e => {
            const arr = JSON.parse(JSON.stringify(data.navbar?.links || []));
            arr[i].href = e.target.value;
            set("navbar.links", arr);
          }} placeholder="#section-id" className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <button onClick={() => set("navbar.links", (data.navbar?.links || []).filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => set("navbar.links", [...(data.navbar?.links || []), { label: "", href: "#" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add nav link
      </button>
      <p className="text-xs text-white-dim font-body mb-4">Available section IDs: #ic-what · #ic-benefits · #ic-process · #ic-faq</p>

      {/* ── Accent Color ── */}
      <SectionTitle>Accent Color</SectionTitle>
      <div className="mb-4 flex items-center gap-3">
        <input type="color" value={data.accentColor || "#FF2DF1"} onChange={e => set("accentColor", e.target.value)}
          className="w-10 h-10 rounded-lg border border-[#2a2a2a] cursor-pointer bg-transparent p-0.5" />
        <input value={data.accentColor || "#FF2DF1"} onChange={e => set("accentColor", e.target.value)}
          placeholder="#FF2DF1"
          className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
        <div className="w-8 h-8 rounded-full border border-[#2a2a2a]" style={{ backgroundColor: data.accentColor }} />
      </div>

      {/* ── HERO ── */}
      <SectionTitle>Hero Section</SectionTitle>
      <F label="Eyebrow text" value={data.hero.eyebrow} onChange={v => set("hero.eyebrow", v)} />
      <F label="Title Line 1" value={data.hero.title1} onChange={v => set("hero.title1", v)} />
      <F label="Title Line 2 (accent color)" value={data.hero.title2} onChange={v => set("hero.title2", v)} />
      <F label="CTA Button Text" value={data.hero.ctaText} onChange={v => set("hero.ctaText", v)} />
      <F label="CTA Subtext" value={data.hero.ctaSubtext} onChange={v => set("hero.ctaSubtext", v)} />

      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Keywords (right side stack)</p>
      {(data.hero.keywords || []).map((kw, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={kw} onChange={e => {
            const arr = [...(data.hero.keywords || [])];
            arr[i] = e.target.value;
            set("hero.keywords", arr);
          }} className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <button onClick={() => set("hero.keywords", (data.hero.keywords || []).filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => set("hero.keywords", [...(data.hero.keywords || []), "New Keyword"])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add keyword
      </button>

      <p className="text-xs text-white-muted mb-2 font-body">Hero Background Media</p>
      <div className="flex gap-2 mb-2">
        <select value={data.hero.mediaType || "none"} onChange={e => set("hero.mediaType", e.target.value)}
          className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red">
          <option value="none">No media</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      {data.hero.mediaType !== "none" && (
        <div className="flex gap-2 mb-4">
          <input value={data.hero.mediaUrl || ""} onChange={e => set("hero.mediaUrl", e.target.value)} placeholder="Paste URL or upload..."
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <UploadButton accept={data.hero.mediaType === "video" ? "video/*" : "image/*"}
            label={data.hero.mediaType === "video" ? "Video" : "Image"}
            onUpload={v => set("hero.mediaUrl", v)} />
        </div>
      )}
      {data.hero.mediaUrl && data.hero.mediaType === "image" && (
        <img src={data.hero.mediaUrl} alt="" className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a] mb-4" />
      )}
      {data.hero.mediaUrl && data.hero.mediaType === "video" && (
        <video src={data.hero.mediaUrl} className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a] mb-4" muted />
      )}

      {/* ── MARQUEE ── */}
      <SectionTitle>Marquee Banner</SectionTitle>
      <p className="text-xs text-white-muted mb-2 font-body">Scrolling text items</p>
      {(data.marquee.items || []).map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={item} onChange={e => {
            const arr = [...(data.marquee.items || [])];
            arr[i] = e.target.value;
            set("marquee.items", arr);
          }} className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <button onClick={() => set("marquee.items", (data.marquee.items || []).filter((_, idx) => idx !== i))}
            className="text-white-muted hover:text-red-400 transition-colors p-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => set("marquee.items", [...(data.marquee.items || []), "New Item"])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add item
      </button>

      {/* ── WHAT IS IT ── */}
      <SectionTitle>What Is It Section</SectionTitle>
      <F label="Eyebrow" value={data.whatIsIt.eyebrow} onChange={v => set("whatIsIt.eyebrow", v)} />
      <F label="Headline (use \\n for line break)" value={data.whatIsIt.headline} onChange={v => set("whatIsIt.headline", v)} multiline />
      <F label="Body Paragraph 1" value={data.whatIsIt.body1} onChange={v => set("whatIsIt.body1", v)} multiline />
      <F label="Body Paragraph 2" value={data.whatIsIt.body2} onChange={v => set("whatIsIt.body2", v)} multiline />

      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Features (numbered list)</p>
      {(data.whatIsIt.features || []).map((feat, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={feat.num} onChange={e => setArr("whatIsIt.features", i, "num", e.target.value)}
              className="w-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red text-center" />
            <input value={feat.title} onChange={e => setArr("whatIsIt.features", i, "title", e.target.value)} placeholder="Title"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => set("whatIsIt.features", (data.whatIsIt.features || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={feat.desc} onChange={e => setArr("whatIsIt.features", i, "desc", e.target.value)} rows={2} placeholder="Description"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
      <button onClick={() => set("whatIsIt.features", [...(data.whatIsIt.features || []), { num: `0${(data.whatIsIt.features||[]).length+1}`, title: "", desc: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add feature
      </button>

      {/* ── WHAT YOU GET ── */}
      <SectionTitle>What You Get Section</SectionTitle>
      <F label="Eyebrow" value={data.whatYouGet.eyebrow} onChange={v => set("whatYouGet.eyebrow", v)} />
      <F label="Headline" value={data.whatYouGet.headline} onChange={v => set("whatYouGet.headline", v)} />
      <F label="Headline Accent (colored)" value={data.whatYouGet.headlineAccent} onChange={v => set("whatYouGet.headlineAccent", v)} />
      <F label="CTA Button Text" value={data.whatYouGet.ctaText} onChange={v => set("whatYouGet.ctaText", v)} />

      <p className="text-xs text-white-muted mb-2 font-body">Background Media</p>
      <div className="flex gap-2 mb-2">
        <select value={data.whatYouGet.mediaType || "none"} onChange={e => set("whatYouGet.mediaType", e.target.value)}
          className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red">
          <option value="none">No background</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      {data.whatYouGet.mediaType !== "none" && (
        <div className="flex gap-2 mb-4">
          <input value={data.whatYouGet.mediaUrl || ""} onChange={e => set("whatYouGet.mediaUrl", e.target.value)} placeholder="Paste URL or upload..."
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <UploadButton accept={data.whatYouGet.mediaType === "video" ? "video/*" : "image/*"}
            label={data.whatYouGet.mediaType === "video" ? "Video" : "Image"}
            onUpload={v => set("whatYouGet.mediaUrl", v)} />
        </div>
      )}
      {data.whatYouGet.mediaUrl && data.whatYouGet.mediaType === "image" && (
        <img src={data.whatYouGet.mediaUrl} alt="" className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a] mb-4" />
      )}
      {data.whatYouGet.mediaUrl && data.whatYouGet.mediaType === "video" && (
        <video src={data.whatYouGet.mediaUrl} className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a] mb-4" muted />
      )}

      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Checklist items — Tag controls the icon shown</p>
      {(data.whatYouGet.items || []).map((item, i) => (
        <div key={i} className="mb-2 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={item.label} onChange={e => setArr("whatYouGet.items", i, "label", e.target.value)} placeholder="Label"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => set("whatYouGet.items", (data.whatYouGet.items || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <select value={item.tag} onChange={e => setArr("whatYouGet.items", i, "tag", e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red">
            {ICON_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      ))}
      <button onClick={() => set("whatYouGet.items", [...(data.whatYouGet.items || []), { label: "", tag: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add item
      </button>

      {/* ── PROCESS ── */}
      <SectionTitle>Process Section</SectionTitle>
      <F label="Eyebrow" value={data.process.eyebrow} onChange={v => set("process.eyebrow", v)} />
      <F label="Headline (use \\n for line break)" value={data.process.headline} onChange={v => set("process.headline", v)} multiline />

      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Steps</p>
      {(data.process.steps || []).map((step, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={step.step} onChange={e => setArr("process.steps", i, "step", e.target.value)}
              className="w-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red text-center" />
            <input value={step.title} onChange={e => setArr("process.steps", i, "title", e.target.value)} placeholder="Title"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => set("process.steps", (data.process.steps || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={step.desc} onChange={e => setArr("process.steps", i, "desc", e.target.value)} rows={2} placeholder="Description"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
      <button onClick={() => set("process.steps", [...(data.process.steps || []), { step: `0${(data.process.steps||[]).length+1}`, title: "", desc: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add step
      </button>

      {/* ── FAQ ── */}
      <SectionTitle>FAQ Section</SectionTitle>
      <F label="Eyebrow" value={data.faq.eyebrow} onChange={v => set("faq.eyebrow", v)} />
      <F label="Headline (use \\n for line break)" value={data.faq.headline} onChange={v => set("faq.headline", v)} multiline />

      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Questions & Answers</p>
      {(data.faq.items || []).map((item, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={item.q} onChange={e => setArr("faq.items", i, "q", e.target.value)} placeholder="Question"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => set("faq.items", (data.faq.items || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={item.a} onChange={e => setArr("faq.items", i, "a", e.target.value)} rows={2} placeholder="Answer"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
      <button onClick={() => set("faq.items", [...(data.faq.items || []), { q: "", a: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mb-4">
        <Plus className="w-4 h-4" /> Add question
      </button>

      {/* ── FINAL CTA ── */}
      <SectionTitle>Final CTA Section</SectionTitle>
      <F label="Eyebrow" value={data.finalCta.eyebrow} onChange={v => set("finalCta.eyebrow", v)} />
      <F label="Headline (use \\n for line break)" value={data.finalCta.headline} onChange={v => set("finalCta.headline", v)} multiline />
      <F label="Headline Accent (colored)" value={data.finalCta.headlineAccent} onChange={v => set("finalCta.headlineAccent", v)} />
      <F label="Body text" value={data.finalCta.body} onChange={v => set("finalCta.body", v)} multiline />
      <F label="CTA Button Text" value={data.finalCta.ctaText} onChange={v => set("finalCta.ctaText", v)} />
      <F label="CTA Subtext" value={data.finalCta.ctaSubtext} onChange={v => set("finalCta.ctaSubtext", v)} />

      {/* Bottom save */}
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