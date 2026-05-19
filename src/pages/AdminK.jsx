import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowLeft, Menu, X, LogOut, Lock } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const SECTIONS = [
  { key: "navbar", label: "Navbar", icon: "☰" },
  { key: "hero", label: "Hero", icon: "★" },
  { key: "degrading", label: "Degrading Body", icon: "⚡" },
  { key: "session", label: "Session Demo", icon: "▶" },
  { key: "pillars", label: "Four Pillars", icon: "◈" },
  { key: "howItFlows", label: "How It Flows", icon: "→" },
  { key: "testimonials", label: "Testimonials", icon: "❝" },
  { key: "pricing", label: "Pricing", icon: "$" },
  { key: "finalCta", label: "Final CTA", icon: "✦" },
  { key: "footer", label: "Footer", icon: "▬" },
];

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

function SectionEditor({ sectionKey }) {
  const { content, update, updateDeep } = useSiteContent();
  const data = content[sectionKey];
  const f = (key, label, multiline = false) => <Field key={key} label={label} value={data[key]} onChange={v => update(sectionKey, key, v)} multiline={multiline} />;
  const m = (key, label, isVideo = false) => <MediaField key={key} label={label} value={data[key]} onChange={v => update(sectionKey, key, v)} isVideo={isVideo} />;

  if (sectionKey === "navbar") return (
    <div>
      {f("brand", "Brand Name")} {f("cta", "CTA Button Text")}
      <p className="text-xs text-white-muted mb-2 mt-1 font-body">Nav Links</p>
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

  if (sectionKey === "session") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headlineAccent", "Headline Accent")} {f("headline2", "Headline 2")}
      {f("subtitle", "Subtitle", true)} {f("sessionLabel", "Session Label")} {m("imageUrl", "Thumbnail / Poster")} {m("videoUrl", "Demo Video", true)}
    </div>
  );

  if (sectionKey === "pillars") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headline2", "Headline 2")} {f("headlineAccent", "Headline Accent")}
      {f("subtitle", "Subtitle", true)} {m("imageUrl", "Banner Image")}
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
      <p className="text-xs text-white-muted mb-2 mt-3 font-body">Testimonials</p>
      {data.items.map((t, i) => (
        <div key={i} className="mb-4 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
          <div className="flex gap-2 mb-2">
            <input value={t.name} onChange={e => updateDeep("testimonials", "items", i, "name", e.target.value)} placeholder="Name"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <input value={t.role} onChange={e => updateDeep("testimonials", "items", i, "role", e.target.value)} placeholder="Role"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          </div>
          <textarea value={t.quote} onChange={e => updateDeep("testimonials", "items", i, "quote", e.target.value)} rows={2} placeholder="Quote"
            className="w-full mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
          <MediaField label="Photo" value={t.img} onChange={v => updateDeep("testimonials", "items", i, "img", v)} />
        </div>
      ))}
      <p className="text-xs text-white-muted mb-2 mt-3 font-body">Social Stats</p>
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
      {f("subtitle", "Subtitle", true)} {f("monthlyPrice", "Monthly Price")} {f("annualPrice", "Annual Price")}
      {f("annualOldPrice", "Annual Old Price")} {f("annualSavings", "Annual Savings Label")} {f("ctaMonthly", "Monthly CTA")} {f("ctaAnnual", "Annual CTA")}
    </div>
  );

  if (sectionKey === "finalCta") return (
    <div>
      {f("eyebrow", "Eyebrow")} {f("headline1", "Headline 1")} {f("headline2", "Headline 2")} {f("headlineAccent", "Headline Accent")}
      {f("subtitle", "Subtitle", true)} {f("ctaPrimary", "Primary CTA")} {f("ctaSecondary", "Secondary CTA")} {f("footnote", "Footnote")} {f("signature", "Signature")}
    </div>
  );

  if (sectionKey === "footer") return (
    <div>{f("brand", "Brand Name")} {f("tagline", "Tagline")} {f("copyright", "Copyright")}</div>
  );

  return null;
}

// Auth gate screen
function AuthGate() {
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
        <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-white-muted hover:text-off-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </div>
    </div>
  );
}

export default function AdminK() {
  const [activeSection, setActiveSection] = useState("hero");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <AuthGate />;
  }

  const activeSectionLabel = SECTIONS.find(s => s.key === activeSection)?.label;

  const handleSectionClick = (key) => {
    setActiveSection(key);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-[#1e1e1e] flex items-center justify-between">
        <div>
          <p className="font-heading text-xl font-bold text-off-white uppercase tracking-widest">KINETIQO</p>
          <p className="text-xs text-white-muted mt-0.5">Site Editor</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] text-white-muted hover:text-off-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {SECTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleSectionClick(key)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all ${
              activeSection === key
                ? "bg-orange-red/10 text-orange-red border-r-2 border-orange-red"
                : "text-white-muted hover:text-off-white hover:bg-white/5"
            }`}
          >
            <span className="w-5 text-center text-base">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="px-6 py-5 border-t border-[#1e1e1e] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-red/20 flex items-center justify-center text-orange-red text-xs font-bold">
            {user.full_name?.[0] || user.email?.[0] || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-off-white truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-white-muted">Admin</p>
          </div>
          <button onClick={() => base44.auth.logout("/")} title="Sign out">
            <LogOut className="w-4 h-4 text-white-muted hover:text-orange-red transition-colors" />
          </button>
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm text-white-muted hover:text-off-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex font-body">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 bg-[#0f0f0f] border-r border-[#1e1e1e] flex-col">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-[#0f0f0f] border-r border-[#1e1e1e] z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="h-16 border-b border-[#1e1e1e] flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-white-muted hover:text-off-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-off-white uppercase tracking-tight leading-none">
                {activeSectionLabel}
              </h1>
              <p className="text-xs text-white-muted hidden sm:block">Changes are live on the site</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-red/10 border border-orange-red/30">
            <span className="w-1.5 h-1.5 bg-orange-red rounded-full animate-pulse" />
            <span className="text-xs text-orange-red font-body hidden sm:block">Live editing</span>
            <span className="text-xs text-orange-red font-body sm:hidden">Live</span>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SectionEditor sectionKey={activeSection} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}