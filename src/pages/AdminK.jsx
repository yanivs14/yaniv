import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowLeft, Menu, X, LogOut, Lock, Users, Settings, Layout, Plus, Trash2, Instagram, Youtube, Twitter, Facebook, Linkedin, Music, Mail, Phone, User as UserIcon, Zap, Play, Download, MessageSquare, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Bell, Circle, CalendarClock, Video, RefreshCw } from "lucide-react";
import InnerCircleEditor from "@/components/admin/InnerCircleEditor";
import PrepPageEditor from "@/components/admin/PrepPageEditor";
import PromotionEditor from "@/components/admin/PromotionEditor";
import HandstandEditor from "@/components/admin/HandstandEditor";
import HsPreEditor from "@/components/admin/HsPreEditor";
import HomeBEditor from "@/components/admin/HomeBEditor";
import DraggableFeatureList from "@/components/admin/DraggableFeatureList";
import Pagination from "@/components/admin/leads/Pagination";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const CONTENT_SECTIONS = [
  { key: "navbar", label: "Navbar", icon: "☰" },
  { key: "hero", label: "Hero", icon: "★" },
  { key: "howItFlows", label: "The Program", icon: "→" },
  { key: "degrading", label: "Who Is It For?", icon: "⚡" },
  { key: "pillars", label: "The Benefits", icon: "◈" },
  { key: "about", label: "Roye Gold", icon: "◉" },
  { key: "testimonials", label: "Our Members", icon: "❝" },
  { key: "faq", label: "FAQ", icon: "?" },
  { key: "pricing", label: "Pricing", icon: "$" },
  { key: "innerCircle", label: "Inner Circle", icon: "⬤" },
  { key: "finalCta", label: "Final CTA", icon: "✦" },
  { key: "footer", label: "Footer", icon: "▬" },
  { key: "social", label: "Social Links", icon: "⬡" },
  { key: "policy_privacy-policy", label: "Privacy Policy", icon: "🔒" },
  { key: "policy_terms-of-use", label: "Terms of Use", icon: "📋" },
  { key: "policy_refund-policy", label: "Refund Policy", icon: "↩" },
  { key: "policy_accessibility-statement", label: "Accessibility", icon: "♿" },
  { key: "policy_consumer-health-statement", label: "Health Statement", icon: "❤" },
];

const SOCIAL_ICON_OPTIONS = ["instagram", "youtube", "twitter", "facebook", "linkedin", "tiktok", "email"];
const SOCIAL_ICON_MAP = { instagram: Instagram, youtube: Youtube, twitter: Twitter, facebook: Facebook, linkedin: Linkedin, tiktok: Music, email: Mail };

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

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white-muted mb-1.5 font-body">{label}</label>
      {multiline ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body resize-none focus:outline-none focus:border-orange-red transition-colors" />
      ) : (
        <input value={value || ""} onChange={e => onChange(e.target.value)}
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
        <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="Paste URL..."
          className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
        <UploadButton accept={isVideo ? "video/*" : "image/*"} label={isVideo ? "Video" : "Image"} onUpload={onChange} />
      </div>
      {value && !isVideo && <img src={value} alt="" className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]" />}
      {value && isVideo && <video src={value} className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]" muted />}
    </div>
  );
}

function SocialEditor() {
  const { content, update } = useSiteContent();
  const links = content.social?.links || [];

  const updateLink = (i, field, val) => {
    const updated = links.map((l, idx) => idx === i ? { ...l, [field]: val } : l);
    update("social", "links", updated);
  };
  const addLink = () => update("social", "links", [...links, { platform: "Instagram", url: "", icon: "instagram" }]);
  const removeLink = (i) => update("social", "links", links.filter((_, idx) => idx !== i));

  return (
    <div>
      <p className="text-xs text-white-muted mb-4 font-body">Manage social media links — shown in header and footer</p>
      {links.map((l, i) => {
        const Icon = SOCIAL_ICON_MAP[l.icon] || Instagram;
        return (
          <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-orange-red flex-shrink-0" />
              <input value={l.platform} onChange={e => updateLink(i, "platform", e.target.value)} placeholder="Platform name"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
              <button onClick={() => removeLink(i)} className="text-white-muted hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input value={l.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://..."
              className="w-full mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <select value={l.icon} onChange={e => updateLink(i, "icon", e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red">
              {SOCIAL_ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>
        );
      })}
      <button onClick={addLink}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
        <Plus className="w-4 h-4" /> Add social link
      </button>
    </div>
  );
}

function SectionEditor({ sectionKey }) {
  const { content, update, updateDeep, resetSection } = useSiteContent();
  if (!content) return null;

  if (sectionKey.startsWith("policy_")) {
    return <PolicyEditor sectionKey={sectionKey} />;
  }

  const data = content[sectionKey];
  if (!data) return null;
  const f = (key, label, multiline = false) => <Field key={key} label={label} value={data[key]} onChange={v => update(sectionKey, key, v)} multiline={multiline} />;
  const m = (key, label, isVideo = false) => <MediaField key={key} label={label} value={data[key]} onChange={v => update(sectionKey, key, v)} isVideo={isVideo} />;

  if (sectionKey === "social") return <SocialEditor />;

  if (sectionKey === "navbar") return (
    <div>
      {f("brand", "Brand Name")} {f("cta", "CTA Button Text")}
      <div className="flex items-center justify-between mb-2 mt-1">
        <p className="text-xs text-white-muted font-body">Nav Links</p>
        <button onClick={() => resetSection("navbar")} className="text-xs text-orange-red hover:text-orange-red-hover transition-colors font-body">↺ Reset to defaults</button>
      </div>
      {data.links.map((link, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={link.label} onChange={e => updateDeep("navbar", "links", i, "label", e.target.value)} placeholder="Label"
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <input value={link.href} onChange={e => updateDeep("navbar", "links", i, "href", e.target.value)} placeholder="Link"
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "hero") return (
    <div>
      {f("headline1", "Headline Line 1")} {f("headline2", "Headline Line 2")} {f("headlineAccent", "Accent Word")} {f("headline3", "Headline Line 3")}
      {f("subtitle", "Subtitle", true)} {f("badge1", "Badge 1")} {f("badge2", "Badge 2")} {f("ctaPrimary", "Primary CTA")} {f("ctaSecondary", "Secondary CTA")}
      {m("videoPoster", "Poster / Fallback Image")} {m("videoUrl", "Hero Video (autoplay)", true)}
    </div>
  );

  if (sectionKey === "degrading") return (
    <div>
      {f("headline1", "Headline 1")} {f("headlineAccent", "Headline Accent")} {f("subtitle", "Subtitle", true)} {m("imageUrl", "Section Image")}
      {f("listTitle", "List Title (above pain points)")}
      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Pain Points</p>
      {data.painPoints.map((pt, i) => (
        <input key={i} value={pt} onChange={e => { const a = [...data.painPoints]; a[i] = e.target.value; update("degrading", "painPoints", a); }}
          className="w-full mb-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
      ))}
      <p className="text-xs text-white-muted mb-2 mt-3 font-body">Stats</p>
      {data.stats.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={s.value} onChange={e => updateDeep("degrading", "stats", i, "value", e.target.value)} placeholder="Value"
            className="w-24 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <input value={s.label} onChange={e => updateDeep("degrading", "stats", i, "label", e.target.value)} placeholder="Label"
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "pillars") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headline2", "Headline 2")} {f("headlineAccent", "Headline Accent")}
      {f("subtitle", "Subtitle", true)}
      <p className="text-xs text-white-muted mb-2 mt-1 font-body font-semibold">Banner Media</p>
      <p className="text-xs text-white-dim mb-3 font-body">YouTube URL takes priority, then uploaded video, then image</p>
      {f("youtubeUrl", "YouTube URL (e.g. https://youtu.be/xxx)")}
      {m("videoUrl", "Upload Video", true)}
      {m("imageUrl", "Fallback Image")}
      <p className="text-xs text-white-muted mb-2 mt-3 font-body">Pillars</p>
      {data.pillars.map((p, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={p.icon} onChange={e => updateDeep("pillars", "pillars", i, "icon", e.target.value)}
              className="w-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red text-center" />
            <input value={p.title} onChange={e => updateDeep("pillars", "pillars", i, "title", e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          </div>
          <input value={p.desc} onChange={e => updateDeep("pillars", "pillars", i, "desc", e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "howItFlows") return (
    <div>
      {f("headline1", "Headline 1")} {f("headlineAccent", "Headline Accent")} {f("headline2", "Headline 2")}
      <p className="text-xs text-white-muted mb-2 mt-3 font-body">Steps</p>
      {data.steps.map((s, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={s.num} onChange={e => updateDeep("howItFlows", "steps", i, "num", e.target.value)}
              className="w-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red text-center" />
            <input value={s.title} onChange={e => updateDeep("howItFlows", "steps", i, "title", e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          </div>
          <textarea value={s.desc} onChange={e => updateDeep("howItFlows", "steps", i, "desc", e.target.value)} rows={2}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "testimonials") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headlineAccent", "Headline Accent")} {f("subtitle", "Subtitle", true)}

      <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Testimonials</p>
      {data.items.map((t, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={t.name || ""} onChange={e => updateDeep("testimonials", "items", i, "name", e.target.value)} placeholder="Name"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <input value={t.role || ""} onChange={e => updateDeep("testimonials", "items", i, "role", e.target.value)} placeholder="Role"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => update("testimonials", "items", data.items.filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={t.quote || ""} onChange={e => updateDeep("testimonials", "items", i, "quote", e.target.value)} rows={2} placeholder="Quote"
            className="w-full mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <p className="text-xs text-white-muted mb-1">Photo</p>
              <div className="flex gap-2">
                <input value={t.img || ""} onChange={e => updateDeep("testimonials", "items", i, "img", e.target.value)} placeholder="Image URL"
                  className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-off-white font-body focus:outline-none focus:border-orange-red" />
                <UploadButton accept="image/*" label="Upload" onUpload={v => updateDeep("testimonials", "items", i, "img", v)} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white-muted mb-1">Video (optional)</p>
              <div className="flex gap-2">
                <input value={t.videoUrl || ""} onChange={e => updateDeep("testimonials", "items", i, "videoUrl", e.target.value)} placeholder="Video URL"
                  className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-off-white font-body focus:outline-none focus:border-orange-red" />
                <UploadButton accept="video/*" label="Upload" onUpload={v => updateDeep("testimonials", "items", i, "videoUrl", v)} />
              </div>
            </div>
          </div>
          {t.img && <img src={t.img} className="w-full h-24 object-cover rounded-lg mb-1" />}
          {t.videoUrl && (
            <div className="flex items-center gap-2 text-xs text-orange-red mt-1">
              <Play className="w-3.5 h-3.5" /> Video attached
            </div>
          )}
        </div>
      ))}
      <button onClick={() => update("testimonials", "items", [...(data.items || []), { name: "", role: "", quote: "", img: "", videoUrl: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2 mb-6">
        <Plus className="w-4 h-4" /> Add testimonial
      </button>

      <p className="text-xs text-white-muted mb-2 mt-1 font-body font-semibold">Social Stats</p>
      {data.stats.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={s.value} onChange={e => updateDeep("testimonials", "stats", i, "value", e.target.value)}
            className="w-24 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <input value={s.label} onChange={e => updateDeep("testimonials", "stats", i, "label", e.target.value)}
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
        </div>
      ))}
    </div>
  );

  if (sectionKey === "pricing") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headline2", "Headline 2")} {f("headlineAccent", "Headline Accent")}
      {f("subtitle", "Subtitle", true)}

      <p className="text-xs text-white-muted font-body font-semibold mt-4 mb-3">Monthly Plan</p>
      {f("monthlyPrice", "Large Price (e.g. $35)")}
      {f("monthlySubtitle", "Monthly Subtitle", true)}
      {f("ctaMonthly", "Monthly CTA Button")}
      <p className="text-xs text-white-muted font-body mb-2">Monthly Features</p>
      <p className="text-xs text-white-dim font-body mb-3">Drag rows to reorder</p>
      <div className="mb-5">
        <DraggableFeatureList
          features={data.monthlyFeatures || []}
          onChange={(arr) => update("pricing", "monthlyFeatures", arr)}
          addLabel="Add feature"
        />
      </div>

      <p className="text-xs text-white-muted font-body font-semibold mt-2 mb-3">Annual Plan</p>
      {f("annualMonthlyPrice", "Large Price (e.g. $20)")}
      {f("annualPrice", "Yearly Price (e.g. $250)")}
      {f("annualSavings", "Savings Label")}
      {f("annualInsteadOf", "Savings Pill (top right of card)")}
      {f("annualSubtitle", "Annual Subtitle", true)}
      {f("ctaAnnual", "Annual CTA Button")}
      <p className="text-xs text-white-muted font-body mb-2">Annual Features</p>
      <p className="text-xs text-white-dim font-body mb-3">Drag rows to reorder · Row 1 & 2 appear bold on site</p>
      <DraggableFeatureList
        features={data.annualFeatures || []}
        onChange={(arr) => update("pricing", "annualFeatures", arr)}
        addLabel="Add feature"
      />

      <p className="text-xs text-white-muted font-body font-semibold mt-6 mb-3">Inner Circle Package</p>
      {f("innerCircleTitle", "Title (e.g. Roye, Maxed Out.)")}
      <Field label="Description" value={data.innerCircleDescription} onChange={v => update("pricing", "innerCircleDescription", v)} multiline />
      {f("innerCircleCta", "CTA Button Text")}
      {f("innerCircleFootnote", "Footnote (below CTA)")}
      <p className="text-xs text-white-muted font-body mb-2">Inner Circle Features</p>
      <DraggableFeatureList
        features={data.innerCircleFeatures || []}
        onChange={(arr) => update("pricing", "innerCircleFeatures", arr)}
        addLabel="Add feature"
      />
    </div>
  );

  if (sectionKey === "finalCta") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headline2", "Headline 2")} {f("headlineAccent", "Headline Accent")}
      {f("subtitle", "Subtitle", true)} {f("ctaSecondary", "CTA Button (quiz)")} {f("footnote", "Footnote")} {f("signature", "Signature")}
    </div>
  );

  if (sectionKey === "innerCircle") return (
    <div>
      {f("eyebrow", "Eyebrow")}
      {f("headline", "Headline")}
      {f("headlineAccent", "Headline Accent (colored)")}
      {f("description", "Opening line", true)}
      {f("paragraph1", "Paragraph 1", true)}
      {f("paragraph2", "Paragraph 2", true)}
      {f("paragraph3", "Paragraph 3", true)}
      {f("ctaLabel", "CTA Label")}
      {f("ctaSubtext", "CTA Subtext", true)}
      {f("ctaButton", "CTA Button Text")}
      {f("ctaUrl", "CTA Link URL")}
      <MediaField label="Section Image" value={data.imageUrl} onChange={v => update("innerCircle", "imageUrl", v)} isVideo={false} />
    </div>
  );

  if (sectionKey === "about") {
    const gallery = data.gallery || [];
    const imageGallery = gallery.filter(g => g.type === "image");
    return (
      <div>
        {f("eyebrow", "Eyebrow")}
        {f("headline", "Headline")}
        {f("headlineAccent", "Headline Accent (colored)")}
        {f("text", "Body Text (7-8 lines)", true)}
        <MediaField label="Main Profile Image" value={data.imageUrl} onChange={v => update("about", "imageUrl", v)} isVideo={false} />

        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Gallery Images (slider)</p>
        <p className="text-xs text-white-dim mb-3 font-body">These appear in the image slider alongside the main image above</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {imageGallery.map((item, i) => {
            const realIdx = gallery.indexOf(item);
            return (
              <div key={i} className="relative rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#111]">
                <img src={item.url} alt="" className="w-full aspect-square object-cover" />
                <button
                  onClick={() => update("about", "gallery", gallery.filter((_, idx) => idx !== realIdx))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
        <UploadButton accept="image/*" label="Add Image" onUpload={url => update("about", "gallery", [...gallery, { url, type: "image" }])} />
      </div>
    );
  }

  if (sectionKey === "faq") return (
    <div>
      <p className="text-xs text-white-muted mb-4 font-body">Manage FAQ questions and answers</p>
      {(data.items || []).map((item, i) => (
        <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex items-start gap-2 mb-2">
            <textarea value={item.question || ""} onChange={e => updateDeep("faq", "items", i, "question", e.target.value)} rows={2} placeholder="Question"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
            <button onClick={() => update("faq", "items", (data.items || []).filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0 mt-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea value={item.answer || ""} onChange={e => updateDeep("faq", "items", i, "answer", e.target.value)} rows={3} placeholder="Answer"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
        </div>
      ))}
      <button onClick={() => update("faq", "items", [...(data.items || []), { question: "", answer: "" }])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
        <Plus className="w-4 h-4" /> Add question
      </button>
    </div>
  );

  if (sectionKey === "footer") return (
    <div>{f("brand", "Brand Name")} {f("tagline", "Tagline")} {f("copyright", "Copyright")}</div>
  );

  return null;
}

function PolicyEditor({ sectionKey }) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    base44.entities.SiteContent.list().then(records => {
      const rec = records.find(r => r.section_key === sectionKey);
      setBody(rec?.data?.body || "");
      setRecordId(rec?.id || null);
    });
  }, [sectionKey]);

  const save = async () => {
    setSaving(true);
    const data = { body };
    if (recordId) {
      await base44.entities.SiteContent.update(recordId, { data });
    } else {
      const created = await base44.entities.SiteContent.create({ section_key: sectionKey, data });
      setRecordId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const slug = sectionKey.replace("policy_", "");

  return (
    <div>
      <p className="text-xs text-white-muted mb-1 font-body">Enter the page content below. Leave empty to hide this page from the footer.</p>
      <a href={`/${slug}`} target="_blank" rel="noreferrer" className="text-xs text-orange-red underline underline-offset-4 mb-4 inline-block hover:text-orange-red-hover transition-colors">
        Preview page →
      </a>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={18}
        placeholder="Enter page content here..."
        className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-off-white font-body resize-none focus:outline-none focus:border-orange-red transition-colors mb-4"
      />
      <button onClick={save} disabled={saving}
        className="w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
        {saved ? "Saved ✓" : saving ? "Saving..." : "Save page"}
      </button>
    </div>
  );
}

// ---- LEADS TAB ----
const STATUS_LABELS = { new: "New", contacted: "Contacted", converted: "Converted" };
const STATUS_COLORS = { new: "bg-orange-red/20 text-orange-red", contacted: "bg-blue-500/20 text-blue-400", converted: "bg-green-500/20 text-green-400" };

function formatIsraelTime(dateStr) {
  if (!dateStr) return "—";
  // Ensure the date string is parsed as UTC — Base44 stores created_date as UTC
  // but the string may arrive without a trailing 'Z', causing the browser to
  // interpret it as local time and skip the timezone conversion.
  let normalized = String(dateStr);
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) {
    normalized = normalized + "Z";
  }
  const d = new Date(normalized);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: false
  }).replace(",", "") + " (GMT+3)";
}

function exportLeadsToExcel(leads) {
  // Build CSV with BOM for Hebrew support in Excel
  const BOM = "\uFEFF";
  const QUIZ_LABELS = {
    pain: "Tension / Pain Area",
    lifestyle: "Hours Sitting Per Day",
    goal: "Primary Goal",
    experience: "Movement Experience",
  };
  const headers = ["שם מלא", "טלפון", "אימייל", "מקור", "סקציה", "המלצה", "מדינה", "שפה", "Tension/Pain", "Hours Sitting", "Primary Goal", "Experience", "סטטוס", "הערות", "תאריך"];
  const rows = leads.map(l => {
    const qa = l.quiz_answers || {};
    return [
      l.full_name || "",
      l.phone || "",
      l.email || "",
      l.source || "",
      l.quiz_section || "",
      l.quiz_recommendation || "",
      l.country || "",
      l.browser_language || "",
      qa.pain || "",
      qa.lifestyle || "",
      qa.goal || "",
      qa.experience || "",
      STATUS_LABELS[l.status] || l.status || "",
      (l.notes || "").replace(/\n/g, " "),
      formatIsraelTime(l.created_date)
    ];
  });
  const csv = BOM + [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const QUIZ_QUESTION_LABELS = {
  pain: "Where do you feel the most tension?",
  lifestyle: "How much of your day do you spend sitting?",
  goal: "What's your primary movement goal?",
  experience: "What's your current movement experience?",
};

function CopyField({ value, icon: Icon, accent }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="flex items-center gap-1 text-xs text-white-muted"><Icon className="w-3 h-3" />—</span>;
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-white-muted hover:text-off-white transition-colors text-left">
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate max-w-[180px] sm:max-w-none">{value}</span>
      {copied
        ? <span className="ml-1 text-[10px] text-orange-red font-semibold">✓</span>
        : <span className="ml-1 text-[10px] text-white-dim opacity-0 group-hover:opacity-100">copy</span>
      }
    </button>
  );
}

function LeadCard({ lead, onStatusChange, onDelete, onNotesChange, meetings }) {
  const [showNotes, setShowNotes] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [notes, setNotes] = useState(lead.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.Lead.update(lead.id, { notes });
    onNotesChange(lead.id, notes);
    setSavingNotes(false);
  };

  const quizAnswers = lead.quiz_answers || {};
  const hasQuizData = Object.keys(quizAnswers).length > 0;

  return (
    <div className="border border-[#2a2a2a] rounded-xl bg-[#111] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-off-white">{lead.full_name}</p>
            <div className="flex flex-col gap-1 mt-1">
              <CopyField value={lead.phone} icon={Phone} />
              {lead.email && <CopyField value={lead.email} icon={Mail} />}
            </div>

            {/* Source + section */}
            <div className="flex flex-wrap gap-2 mt-2">
              {lead.quiz_recommendation && (
                <span className="text-xs text-orange-red font-medium">{lead.quiz_recommendation}</span>
              )}
              {lead.quiz_section && (
                <span className="text-[10px] bg-[#1a1a1a] border border-[#2a2a2a] text-white-muted px-2 py-0.5 rounded-full">
                  Section: {lead.quiz_section}
                </span>
              )}
              {lead.selected_plan && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lead.selected_plan === "annual" ? "bg-orange-red/10 border-orange-red/40 text-orange-red" : "bg-[#1a1a1a] border-[#2a2a2a] text-white-muted"}`}>
                  {lead.selected_plan === "annual" ? "⭐ Annual" : "Monthly"}
                </span>
              )}
            </div>

            {/* Meta: time, country, language */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
              <span className="text-xs text-white-dim">{formatIsraelTime(lead.created_date)}</span>
              {lead.country && <span className="text-xs text-white-dim">🌍 {lead.country}</span>}
              {lead.browser_language && <span className="text-xs text-white-dim">🗣 {lead.browser_language}</span>}
            </div>

            {/* Calendly meetings */}
            {meetings?.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {meetings.map((m, i) => (
                  <div key={m.event_uuid + i} className="inline-flex flex-col bg-orange-red/10 border border-orange-red/25 rounded-lg px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5 text-orange-red flex-shrink-0" />
                      <span className="text-[11px] text-off-white font-semibold">{m.formatted_time}</span>
                    </div>
                    <span className="text-[10px] text-white-muted ml-5">{m.event_name}</span>
                    {m.join_url && (
                      <a href={m.join_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 mt-0.5 ml-5 text-[10px] text-orange-red hover:underline">
                        <Video className="w-3 h-3" /> Join call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={lead.status || "new"} onChange={e => onStatusChange(lead.id, e.target.value)}
              className={`text-xs px-2 py-1 rounded-full border-0 font-body cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status || "new"]}`}>
              {Object.entries(STATUS_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#1e1e1e] flex-wrap">
          <button onClick={() => setShowNotes(n => !n)}
            className="flex items-center gap-1.5 text-xs text-white-muted hover:text-off-white transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            {lead.notes ? "Notes" : "Add Note"}
            {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {hasQuizData && (
            <button onClick={() => setShowQuiz(q => !q)}
              className="flex items-center gap-1.5 text-xs text-white-muted hover:text-orange-red transition-colors">
              <Circle className="w-3.5 h-3.5" />
              Quiz answers
              {showQuiz ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          <div className="flex-1" />
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-xs text-white-dim hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white-muted">Sure?</span>
              <button onClick={() => onDelete(lead.id)} className="text-xs text-red-400 font-semibold hover:text-red-300 transition-colors">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-white-muted hover:text-off-white transition-colors">No</button>
            </div>
          )}
        </div>
      </div>

      {/* Quiz answers panel */}
      {showQuiz && hasQuizData && (
        <div className="px-4 pb-4 border-t border-[#1e1e1e] pt-3 bg-[#0d0d0d]">
          <p className="text-[10px] text-white-dim uppercase tracking-widest mb-3">Quiz Answers</p>
          <div className="space-y-2">
            {Object.entries(quizAnswers).map(([key, val]) => (
              <div key={key} className="flex gap-3">
                <span className="text-xs text-white-muted min-w-0 flex-1">{QUIZ_QUESTION_LABELS[key] || key}</span>
                <span className="text-xs text-off-white font-medium text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes panel */}
      {showNotes && (
        <div className="px-4 pb-4 border-t border-[#1e1e1e] pt-3">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Add a note..."
            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body resize-none focus:outline-none focus:border-orange-red transition-colors mb-2"
          />
          <button onClick={saveNotes} disabled={savingNotes}
            className="text-xs bg-orange-red text-dark-bg font-semibold px-4 py-1.5 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
            {savingNotes ? "Saving..." : "Save Note"}
          </button>
        </div>
      )}
    </div>
  );
}

function LeadsTab() {
  const [leads, setLeads] = useState([]);
  const [meetingsMap, setMeetingsMap] = useState({});
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  const loadMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const res = await base44.functions.invoke("getCalendlyMeetings", {});
      setMeetingsMap(res.data?.meetingsByEmail || {});
    } catch (e) {
      console.error("Failed to load Calendly meetings:", e);
    }
    setLoadingMeetings(false);
  };

  useEffect(() => {
    base44.entities.Lead.list("-created_date", 2000).then(data => {
      setLeads(data);
      setLoading(false);
    });
    loadMeetings();
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Lead.update(id, { status });
    setLeads(l => l.map(x => x.id === id ? { ...x, status } : x));
  };

  const deleteLead = async (id) => {
    await base44.entities.Lead.delete(id);
    setLeads(l => l.filter(x => x.id !== id));
  };

  const updateNotes = (id, notes) => {
    setLeads(l => l.map(x => x.id === id ? { ...x, notes } : x));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /></div>;

  const totalPages = Math.ceil(leads.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedLeads = leads.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-white-muted font-body">{leads.length} leads</p>
          {Object.values(meetingsMap).reduce((s, a) => s + a.length, 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-red font-body">
              <CalendarClock className="w-3.5 h-3.5" />
              {Object.values(meetingsMap).reduce((s, a) => s + a.length, 0)} upcoming calls
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadMeetings} disabled={loadingMeetings}
            className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-off-white px-3 py-2 rounded-lg hover:border-orange-red hover:text-orange-red transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMeetings ? "animate-spin" : ""}`} /> Sync Calendly
          </button>
          {leads.length > 0 && (
            <button onClick={() => exportLeadsToExcel(leads)}
              className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-off-white px-3 py-2 rounded-lg hover:border-orange-red hover:text-orange-red transition-colors">
              <Download className="w-3.5 h-3.5" /> Export to Excel
            </button>
          )}
        </div>
      </div>
      {leads.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 text-white-muted mx-auto mb-3" />
          <p className="text-white-muted font-body text-sm">No leads yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedLeads.map(l => (
            <LeadCard
              key={l.id}
              lead={l}
              onStatusChange={updateStatus}
              onDelete={deleteLead}
              onNotesChange={updateNotes}
              meetings={l.email ? meetingsMap[l.email.toLowerCase()] : undefined}
            />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

// ---- NEWSLETTER TAB ----
function SubscriberRow({ s, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="flex items-center gap-3 border border-[#2a2a2a] rounded-xl bg-[#111] px-4 py-3">
      <Mail className="w-4 h-4 text-orange-red flex-shrink-0" />
      <span className="flex-1 font-body text-sm text-off-white truncate">{s.email}</span>
      {s.source && <span className="text-xs text-white-dim font-body bg-[#1a1a1a] px-2 py-0.5 rounded-full">{s.source}</span>}
      <span className="text-xs text-white-dim font-body">{new Date(s.created_date).toLocaleDateString("he-IL")}</span>
      {!confirmDelete ? (
        <button onClick={() => setConfirmDelete(true)} className="text-white-muted hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white-muted">Sure?</span>
          <button onClick={() => onDelete(s.id)} className="text-xs text-red-400 font-semibold hover:text-red-300 transition-colors">Yes</button>
          <button onClick={() => setConfirmDelete(false)} className="text-xs text-white-muted hover:text-off-white transition-colors">No</button>
        </div>
      )}
    </div>
  );
}

function NewsletterTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NewsletterSubscriber.list("-created_date", 500).then(data => {
      setSubscribers(data);
      setLoading(false);
    });
  }, []);

  const deleteSubscriber = async (id) => {
    await base44.entities.NewsletterSubscriber.delete(id);
    setSubscribers(s => s.filter(x => x.id !== id));
  };

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const rows = [["Email", "Source", "Date"], ...subscribers.map(s => [
      s.email,
      s.source || "",
      new Date(s.created_date).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })
    ])];
    const csv = BOM + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-white-muted font-body">{subscribers.length} subscribers</p>
        {subscribers.length > 0 && (
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-off-white px-3 py-2 rounded-lg hover:border-orange-red hover:text-orange-red transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        )}
      </div>
      {subscribers.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-white-muted mx-auto mb-3" />
          <p className="text-white-muted font-body text-sm">No subscribers yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscribers.map(s => (
            <SubscriberRow key={s.id} s={s} onDelete={deleteSubscriber} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- SETTINGS TAB ----
function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.LeadSettings.list().then(data => {
      if (data.length > 0) setSettings(data[0]);
      else setSettings({ recipient_emails: [], active: true });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    // If there's text in the newEmail field, add it before saving
    const finalSettings = newEmail.trim()
      ? { ...settings, recipient_emails: [...(settings.recipient_emails || []), newEmail.trim()] }
      : settings;
    if (newEmail.trim()) setNewEmail("");
    setSaving(true);
    if (finalSettings.id) {
      const updated = await base44.entities.LeadSettings.update(finalSettings.id, finalSettings);
      setSettings(updated);
    } else {
      const created = await base44.entities.LeadSettings.create(finalSettings);
      setSettings(created);
    }
    setSaving(false);
  };

  const addEmail = () => {
    if (!newEmail.trim()) return;
    setSettings(s => ({ ...s, recipient_emails: [...(s.recipient_emails || []), newEmail.trim()] }));
    setNewEmail("");
  };

  const removeEmail = (i) => setSettings(s => ({ ...s, recipient_emails: s.recipient_emails.filter((_, idx) => idx !== i) }));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <p className="text-sm text-off-white font-body font-semibold mb-1">Lead notification emails</p>
      <p className="text-xs text-white-muted font-body mb-4">Every new lead will be sent to these emails</p>
      <div className="space-y-2 mb-4">
        {(settings.recipient_emails || []).map((em, i) => (
          <div key={i} className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2">
            <Mail className="w-4 h-4 text-white-muted flex-shrink-0" />
            <span className="flex-1 text-sm text-off-white font-body">{em}</span>
            <button onClick={() => removeEmail(i)} className="text-white-muted hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        <input value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && addEmail()} placeholder="Add email..."
          className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
        <button onClick={addEmail} className="px-4 py-2 bg-orange-red text-dark-bg rounded-lg text-sm font-body font-semibold hover:bg-orange-red-hover transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <button onClick={save} disabled={saving}
        className="w-full bg-orange-red text-dark-bg font-body text-sm font-bold py-3 rounded-full hover:bg-orange-red-hover transition-colors disabled:opacity-60">
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}

// ---- HOME-B TAB ----
const HOME_B_SECTIONS = [
  { key: "socialProof", label: "Social Proof" },
  { key: "seeInside", label: "See Inside" },
  { key: "comparison", label: "Comparison Chart" },
  { key: "builtForEveryone", label: "Built For Everyone" },
  { key: "beforeAfter", label: "Before & After" },
];

function HomeBTab() {
  const [activeSection, setActiveSection] = useState("socialProof");
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {HOME_B_SECTIONS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={`text-xs font-body px-3 py-2 rounded-lg transition-colors ${activeSection === key ? "bg-orange-red text-dark-bg font-semibold" : "bg-[#1a1a1a] border border-[#2a2a2a] text-white-muted hover:text-off-white"}`}>
            {label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <HomeBEditor section={activeSection} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---- AUTH GATE ----
function AuthGate({ homePath = "/" }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7 text-orange-red" />
        </div>
        <p className="font-heading text-3xl font-bold text-off-white uppercase tracking-tight mb-2">Admin Only</p>
        <p className="font-body text-sm text-white-muted mb-8">You need to be signed in as an admin to access this panel.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="w-full flex items-center justify-center gap-3 bg-off-white text-[#0a0a0a] font-body text-sm font-semibold py-3.5 rounded-full hover:bg-off-white/90 transition-colors"
        >
          Sign in to continue
        </button>
        <Link to={homePath} className="mt-4 inline-flex items-center gap-1.5 text-sm text-white-muted hover:text-off-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </div>
    </div>
  );
}

// ---- MAIN ----
const TABS = [
  { key: "content", label: "Content", icon: Layout },
  { key: "innercircle", label: "Inner Circle", icon: Circle },
  { key: "leads", label: "Leads", icon: Users },
  { key: "newsletter", label: "Newsletter", icon: Bell },
  { key: "prep7", label: "Prep Page", icon: Play },
  { key: "promotion", label: "Promo Page", icon: Zap },
  { key: "handstand", label: "Handstand", icon: Zap },
  { key: "hspre", label: "HsPre Page", icon: Zap },
  { key: "homeb", label: "Home-B", icon: Layout },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function AdminK({ homePath = "/" }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [activeTab, setActiveTab] = useState("content");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(undefined); // undefined = not checked yet

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  // Still checking auth — show nothing (blank screen prevents flash)
  if (user === undefined) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== "admin") return <AuthGate homePath={homePath} />;

  const activeSectionLabel = CONTENT_SECTIONS.find(s => s.key === activeSection)?.label;

  const handleSectionClick = (key) => {
    setActiveSection(key);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-[#1e1e1e] flex items-center justify-between">
        <div>
          <p className="font-heading text-xl font-bold text-off-white uppercase tracking-widest">KINETIQO</p>
          <p className="text-xs text-white-muted mt-0.5">Site Editor</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] text-white-muted hover:text-off-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-[#1e1e1e]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex flex-col items-center gap-1.5 py-3 px-1 text-xs font-body transition-colors border-b-2 ${activeTab === key ? "text-orange-red border-orange-red" : "text-white-muted hover:text-off-white border-transparent"}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="leading-tight text-center">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === "content" && (
        <nav className="flex-1 py-2 overflow-y-auto">
          {CONTENT_SECTIONS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => handleSectionClick(key)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${activeSection === key ? "bg-orange-red/10 text-orange-red border-r-2 border-orange-red" : "text-white-muted hover:text-off-white hover:bg-white/5"}`}>
              <span className="w-5 text-center">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      )}

      {activeTab !== "content" && <div className="flex-1" />}

      <div className="px-5 py-4 border-t border-[#1e1e1e] space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-red/20 flex items-center justify-center text-orange-red text-xs font-bold">
            {user.full_name?.[0] || user.email?.[0] || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-off-white truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-white-muted">Admin</p>
          </div>
          <button onClick={() => base44.auth.logout(homePath)} title="Sign out">
            <LogOut className="w-4 h-4 text-white-muted hover:text-orange-red transition-colors" />
          </button>
        </div>
        <Link to={homePath} className="flex items-center gap-2 text-sm text-white-muted hover:text-off-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex font-body">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 flex-shrink-0 bg-[#0f0f0f] border-r border-[#1e1e1e] flex-col">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#0f0f0f] border-r border-[#1e1e1e] z-50 flex flex-col lg:hidden">
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="h-14 border-b border-[#1e1e1e] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-white-muted hover:text-off-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">
              {activeTab === "content" ? activeSectionLabel : activeTab === "leads" ? "Leads" : activeTab === "innercircle" ? "Inner Circle Page" : activeTab === "prep7" ? "Prep Page" : activeTab === "promotion" ? "Promo Page" : activeTab === "handstand" ? "Handstand Landing" : activeTab === "hspre" ? "HsPre Page" : activeTab === "homeb" ? "Home-B Sections" : activeTab === "newsletter" ? "Newsletter" : "Settings"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/crm" className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-off-white px-3 py-2 rounded-lg hover:border-orange-red hover:text-orange-red transition-colors whitespace-nowrap">
              <Mail className="w-3.5 h-3.5" /> CRM
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-red/10 border border-orange-red/30">
              <span className="w-1.5 h-1.5 bg-orange-red rounded-full animate-pulse" />
              <span className="text-xs text-orange-red font-body">Live</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "content" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <SectionEditor sectionKey={activeSection} />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          {activeTab === "innercircle" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <InnerCircleEditor />
            </div>
          )}
          {activeTab === "leads" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <LeadsTab />
            </div>
          )}
          {activeTab === "newsletter" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <NewsletterTab />
            </div>
          )}
          {activeTab === "prep7" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <PrepPageEditor />
            </div>
          )}
          {activeTab === "promotion" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <PromotionEditor />
            </div>
          )}
          {activeTab === "handstand" && (
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
              <HandstandEditor />
            </div>
          )}
          {activeTab === "hspre" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <HsPreEditor />
            </div>
          )}
          {activeTab === "homeb" && (
            <HomeBTab />
          )}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6">
              <SettingsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}