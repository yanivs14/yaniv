import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight, Upload, Image, Type, Link2 } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";

const SECTIONS = [
  { key: "navbar", label: "Navbar" },
  { key: "hero", label: "Hero" },
  { key: "degrading", label: "Degrading Body" },
  { key: "session", label: "Session Demo" },
  { key: "pillars", label: "Four Pillars" },
  { key: "howItFlows", label: "How It Flows" },
  { key: "testimonials", label: "Testimonials" },
  { key: "pricing", label: "Pricing" },
  { key: "finalCta", label: "Final CTA" },
  { key: "footer", label: "Footer" },
];

function UploadButton({ onUpload, accept = "image/*", label = "Upload image" }) {
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
    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-dark-bg border border-dark-border rounded-lg hover:border-orange-red transition-colors text-xs text-white-muted hover:text-off-white">
      {loading ? (
        <div className="w-3 h-3 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      ) : (
        <Upload className="w-3 h-3" />
      )}
      {loading ? "Uploading..." : label}
      <input type="file" accept={accept} className="hidden" onChange={handleFile} />
    </label>
  );
}

function TextField({ label, value, onChange, multiline = false }) {
  return (
    <div className="mb-3">
      <label className="block font-body text-xs text-white-muted mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 font-body text-xs text-off-white resize-none focus:outline-none focus:border-orange-red transition-colors"
        />
      ) : (
        <input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 font-body text-xs text-off-white focus:outline-none focus:border-orange-red transition-colors"
        />
      )}
    </div>
  );
}

function MediaField({ label, value, onChange, isVideo = false }) {
  return (
    <div className="mb-3">
      <label className="block font-body text-xs text-white-muted mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        <input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste URL..."
          className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 font-body text-xs text-off-white focus:outline-none focus:border-orange-red transition-colors"
        />
        <UploadButton
          accept={isVideo ? "video/*" : "image/*"}
          label={isVideo ? "Upload video" : "Upload image"}
          onUpload={onChange}
        />
      </div>
      {value && !isVideo && (
        <img src={value} alt="" className="mt-2 w-full h-20 object-cover rounded-lg border border-dark-border" />
      )}
      {value && isVideo && (
        <video src={value} className="mt-2 w-full h-20 object-cover rounded-lg border border-dark-border" muted />
      )}
    </div>
  );
}

function SectionEditor({ sectionKey }) {
  const { content, update, updateDeep } = useSiteContent();
  const data = content[sectionKey];

  const field = (key, label, multiline = false) => (
    <TextField key={key} label={label} value={data[key]} onChange={v => update(sectionKey, key, v)} multiline={multiline} />
  );
  const media = (key, label, isVideo = false) => (
    <MediaField key={key} label={label} value={data[key]} onChange={v => update(sectionKey, key, v)} isVideo={isVideo} />
  );

  if (sectionKey === "navbar") return (
    <div>
      {field("brand", "Brand Name")}
      {field("cta", "CTA Button Text")}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Nav Links</label>
      {data.links.map((link, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={link.label} onChange={e => updateDeep("navbar", "links", i, "label", e.target.value)}
            className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" placeholder="Label" />
          <input value={link.href} onChange={e => updateDeep("navbar", "links", i, "href", e.target.value)}
            className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" placeholder="Link" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "hero") return (
    <div>
      {field("headline1", "Headline Line 1")}
      {field("headline2", "Headline Line 2")}
      {field("headlineAccent", "Headline Accent Word")}
      {field("headline3", "Headline Line 3")}
      {field("subtitle", "Subtitle", true)}
      {field("badge1", "Badge 1")}
      {field("badge2", "Badge 2")}
      {field("ctaPrimary", "Primary CTA")}
      {field("ctaSecondary", "Secondary CTA")}
      {media("videoPoster", "Video Poster / Fallback Image")}
      {media("videoUrl", "Hero Video (autoplay)", true)}
    </div>
  );

  if (sectionKey === "degrading") return (
    <div>
      {field("headline1", "Headline Line 1")}
      {field("headlineAccent", "Headline Accent")}
      {field("subtitle", "Subtitle", true)}
      {media("imageUrl", "Section Image")}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Pain Points</label>
      {data.painPoints.map((pt, i) => (
        <input key={i} value={pt} onChange={e => { const arr = [...data.painPoints]; arr[i] = e.target.value; update("degrading", "painPoints", arr); }}
          className="w-full mb-2 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" />
      ))}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Stats</label>
      {data.stats.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={s.value} onChange={e => updateDeep("degrading", "stats", i, "value", e.target.value)}
            className="w-20 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" placeholder="Value" />
          <input value={s.label} onChange={e => updateDeep("degrading", "stats", i, "label", e.target.value)}
            className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" placeholder="Label" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "session") return (
    <div>
      {field("eyebrow", "Eyebrow")}
      {field("headline1", "Headline 1")}
      {field("headlineAccent", "Headline Accent")}
      {field("headline2", "Headline 2")}
      {field("subtitle", "Subtitle", true)}
      {field("sessionLabel", "Session Label")}
      {media("imageUrl", "Thumbnail / Poster Image")}
      {media("videoUrl", "Demo Video (optional)", true)}
    </div>
  );

  if (sectionKey === "pillars") return (
    <div>
      {field("eyebrow", "Eyebrow")}
      {field("headline1", "Headline 1")}
      {field("headline2", "Headline 2")}
      {field("headlineAccent", "Headline Accent")}
      {field("subtitle", "Subtitle", true)}
      {media("imageUrl", "Banner Image")}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Pillars</label>
      {data.pillars.map((p, i) => (
        <div key={i} className="mb-3 border border-dark-border rounded-lg p-2">
          <div className="flex gap-2 mb-1.5">
            <input value={p.icon} onChange={e => updateDeep("pillars", "pillars", i, "icon", e.target.value)}
              className="w-10 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red text-center" />
            <input value={p.title} onChange={e => updateDeep("pillars", "pillars", i, "title", e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" />
          </div>
          <input value={p.desc} onChange={e => updateDeep("pillars", "pillars", i, "desc", e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "howItFlows") return (
    <div>
      {field("headline1", "Headline 1")}
      {field("headlineAccent", "Headline Accent")}
      {field("headline2", "Headline 2")}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Steps</label>
      {data.steps.map((s, i) => (
        <div key={i} className="mb-3 border border-dark-border rounded-lg p-2">
          <div className="flex gap-2 mb-1.5">
            <input value={s.num} onChange={e => updateDeep("howItFlows", "steps", i, "num", e.target.value)}
              className="w-10 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red text-center" />
            <input value={s.title} onChange={e => updateDeep("howItFlows", "steps", i, "title", e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" />
          </div>
          <textarea value={s.desc} onChange={e => updateDeep("howItFlows", "steps", i, "desc", e.target.value)} rows={2}
            className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "testimonials") return (
    <div>
      {field("eyebrow", "Eyebrow")}
      {field("headline1", "Headline 1")}
      {field("headlineAccent", "Headline Accent")}
      {field("subtitle", "Subtitle", true)}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Testimonials</label>
      {data.items.map((t, i) => (
        <div key={i} className="mb-4 border border-dark-border rounded-lg p-2">
          <div className="flex gap-2 mb-2">
            <input value={t.name} onChange={e => updateDeep("testimonials", "items", i, "name", e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" placeholder="Name" />
            <input value={t.role} onChange={e => updateDeep("testimonials", "items", i, "role", e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" placeholder="Role" />
          </div>
          <textarea value={t.quote} onChange={e => updateDeep("testimonials", "items", i, "quote", e.target.value)} rows={2}
            className="w-full mb-2 bg-dark-bg border border-dark-border rounded px-2 py-1 font-body text-xs text-off-white focus:outline-none focus:border-orange-red resize-none" placeholder="Quote" />
          <MediaField label="Photo" value={t.img} onChange={v => updateDeep("testimonials", "items", i, "img", v)} />
        </div>
      ))}
      <label className="block font-body text-xs text-white-muted mb-2 mt-3">Social Stats</label>
      {data.stats.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={s.value} onChange={e => updateDeep("testimonials", "stats", i, "value", e.target.value)}
            className="w-20 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" />
          <input value={s.label} onChange={e => updateDeep("testimonials", "stats", i, "label", e.target.value)}
            className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 font-body text-xs text-off-white focus:outline-none focus:border-orange-red" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "pricing") return (
    <div>
      {field("eyebrow", "Eyebrow")}
      {field("headline1", "Headline 1")}
      {field("headline2", "Headline 2")}
      {field("headlineAccent", "Headline Accent")}
      {field("subtitle", "Subtitle", true)}
      {field("monthlyPrice", "Monthly Price")}
      {field("annualPrice", "Annual Price")}
      {field("annualOldPrice", "Annual Old Price (strikethrough)")}
      {field("annualSavings", "Annual Savings Label")}
      {field("ctaMonthly", "Monthly CTA")}
      {field("ctaAnnual", "Annual CTA")}
    </div>
  );

  if (sectionKey === "finalCta") return (
    <div>
      {field("eyebrow", "Eyebrow")}
      {field("headline1", "Headline 1")}
      {field("headline2", "Headline 2")}
      {field("headlineAccent", "Headline Accent")}
      {field("subtitle", "Subtitle", true)}
      {field("ctaPrimary", "Primary CTA")}
      {field("ctaSecondary", "Secondary CTA")}
      {field("footnote", "Footnote")}
      {field("signature", "Signature")}
    </div>
  );

  if (sectionKey === "footer") return (
    <div>
      {field("brand", "Brand Name")}
      {field("tagline", "Tagline")}
      {field("copyright", "Copyright")}
    </div>
  );

  return null;
}

export default function AdminPanel({ onClose }) {
  const [openSection, setOpenSection] = useState("hero");

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="fixed top-0 right-0 h-full w-80 bg-dark-surface border-l border-dark-border z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border flex-shrink-0">
        <div>
          <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">Site Editor</p>
          <p className="font-body text-xs text-white-muted">Edit all content & media</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-bg hover:bg-dark-border transition-colors">
          <X className="w-4 h-4 text-white-muted" />
        </button>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="border-b border-dark-border/50">
            <button
              onClick={() => setOpenSection(openSection === key ? null : key)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-dark-bg/50 transition-colors"
            >
              <span className="font-body text-sm text-off-white">{label}</span>
              <motion.div animate={{ rotate: openSection === key ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4 text-white-muted" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openSection === key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2">
                    <SectionEditor sectionKey={key} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-dark-border">
        <p className="font-body text-xs text-white-dim text-center">Changes are live instantly</p>
      </div>
    </motion.div>
  );
}