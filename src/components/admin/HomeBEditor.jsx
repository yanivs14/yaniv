import { useState } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";

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
  const [loading, setLoading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setLoading(false);
  };
  return (
    <div className="mb-4">
      <label className="block text-xs text-white-muted mb-1.5 font-body">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="Paste URL..."
          className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
        <label className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-orange-red transition-colors text-xs text-white-muted hover:text-off-white whitespace-nowrap">
          {loading ? <div className="w-3 h-3 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3 h-3" />}
          {loading ? "Uploading..." : (isVideo ? "Video" : "Image")}
          <input type="file" accept={isVideo ? "video/*" : "image/*"} className="hidden" onChange={handleFile} />
        </label>
      </div>
      {value && !isVideo && <img src={value} alt="" className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]" />}
      {value && isVideo && <video src={value} className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]" muted />}
    </div>
  );
}

export default function HomeBEditor({ section }) {
  const { content, update, updateDeep } = useSiteContent();

  if (section === "socialProof") {
    const data = content.homebSocialProof || { stats: [] };
    const stats = data.stats || [];
    return (
      <div>
        <p className="text-xs text-white-muted mb-4 font-body">4 statistics shown in a dark blue bar below the hero</p>
        {stats.map((s, i) => (
          <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <input value={s.value || ""} onChange={e => updateDeep("homebSocialProof", "stats", i, "value", e.target.value)} placeholder="Value (e.g. 1.5M)"
                  className="w-full mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
                <input value={s.label || ""} onChange={e => updateDeep("homebSocialProof", "stats", i, "label", e.target.value)} placeholder="Label"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
              </div>
              <button onClick={() => update("homebSocialProof", "stats", stats.filter((_, idx) => idx !== i))}
                className="text-white-muted hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => update("homebSocialProof", "stats", [...stats, { value: "", label: "" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add stat
        </button>
      </div>
    );
  }

  if (section === "seeInside") {
    const data = content.homebSeeInside || {};
    const steps = data.steps || [];
    return (
      <div>
        <Field label="Eyebrow" value={data.eyebrow} onChange={v => update("homebSeeInside", "eyebrow", v)} />
        <Field label="Headline" value={data.headline} onChange={v => update("homebSeeInside", "headline", v)} />
        <Field label="Subtitle" value={data.subtitle} onChange={v => update("homebSeeInside", "subtitle", v)} multiline />
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Flow Steps</p>
        {steps.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={s} onChange={e => { const a = [...steps]; a[i] = e.target.value; update("homebSeeInside", "steps", a); }}
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <button onClick={() => update("homebSeeInside", "steps", steps.filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => update("homebSeeInside", "steps", [...steps, ""])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2 mb-6">
          <Plus className="w-4 h-4" /> Add step
        </button>
        <Field label="YouTube URL (e.g. https://youtu.be/xxx)" value={data.youtubeUrl} onChange={v => update("homebSeeInside", "youtubeUrl", v)} />
        <MediaField label="Video (MP4 or URL) — used if no YouTube URL" value={data.videoUrl} onChange={v => update("homebSeeInside", "videoUrl", v)} isVideo />
        <MediaField label="Fallback Image" value={data.imageUrl} onChange={v => update("homebSeeInside", "imageUrl", v)} />
      </div>
    );
  }

  if (section === "comparison") {
    const data = content.homebComparison || {};
    const rows = data.rows || [];
    const columns = data.columns || ["", "", ""];
    return (
      <div>
        <Field label="Eyebrow" value={data.eyebrow} onChange={v => update("homebComparison", "eyebrow", v)} />
        <Field label="Headline" value={data.headline} onChange={v => update("homebComparison", "headline", v)} multiline />
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Column Names</p>
        {[0, 1, 2].map(i => (
          <input key={i} value={columns[i] || ""} onChange={e => { const a = [...columns]; a[i] = e.target.value; update("homebComparison", "columns", a); }}
            className="w-full mb-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
        ))}
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Comparison Rows</p>
        {rows.map((row, i) => (
          <div key={i} className="mb-3 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
            <div className="flex gap-2 mb-2">
              <input value={row.feature || ""} onChange={e => updateDeep("homebComparison", "rows", i, "feature", e.target.value)} placeholder="Feature"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
              <button onClick={() => update("homebComparison", "rows", rows.filter((_, idx) => idx !== i))}
                className="text-white-muted hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input value={row.movement || ""} onChange={e => updateDeep("homebComparison", "rows", i, "movement", e.target.value)} placeholder="The Movement"
              className="w-full mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <input value={row.youtube || ""} onChange={e => updateDeep("homebComparison", "rows", i, "youtube", e.target.value)} placeholder="Random YouTube"
              className="w-full mb-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
            <input value={row.gym || ""} onChange={e => updateDeep("homebComparison", "rows", i, "gym", e.target.value)} placeholder="Traditional Gym"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          </div>
        ))}
        <button onClick={() => update("homebComparison", "rows", [...rows, { feature: "", movement: "", youtube: "", gym: "" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add row
        </button>
      </div>
    );
  }

  if (section === "builtForEveryone") {
    const data = content.homebBuiltForEveryone || {};
    const paragraphs = data.paragraphs || [];
    return (
      <div>
        <Field label="Eyebrow" value={data.eyebrow} onChange={v => update("homebBuiltForEveryone", "eyebrow", v)} />
        <Field label="Headline" value={data.headline} onChange={v => update("homebBuiltForEveryone", "headline", v)} />
        <p className="text-xs text-white-muted mb-2 mt-3 font-body font-semibold">Paragraphs</p>
        {paragraphs.map((p, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <textarea value={p} onChange={e => { const a = [...paragraphs]; a[i] = e.target.value; update("homebBuiltForEveryone", "paragraphs", a); }} rows={3}
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
            <button onClick={() => update("homebBuiltForEveryone", "paragraphs", paragraphs.filter((_, idx) => idx !== i))}
              className="text-white-muted hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => update("homebBuiltForEveryone", "paragraphs", [...paragraphs, ""])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add paragraph
        </button>
      </div>
    );
  }

  if (section === "beforeAfter") {
    const data = content.homebBeforeAfter || {};
    const items = data.items || [];
    return (
      <div>
        <Field label="Eyebrow" value={data.eyebrow} onChange={v => update("homebBeforeAfter", "eyebrow", v)} />
        <Field label="Headline" value={data.headline} onChange={v => update("homebBeforeAfter", "headline", v)} />
        <Field label="Subtitle" value={data.subtitle} onChange={v => update("homebBeforeAfter", "subtitle", v)} multiline />
        <p className="text-xs text-white-muted mb-2 mt-4 font-body font-semibold">Before & After Items</p>
        {items.map((item, i) => (
          <div key={i} className="mb-4 border border-[#2a2a2a] rounded-xl p-3 bg-[#111]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-white-dim">Item {i + 1}</span>
              <button onClick={() => update("homebBeforeAfter", "items", items.filter((_, idx) => idx !== i))}
                className="text-white-muted hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MediaField label="Before Image" value={item.beforeImg} onChange={v => updateDeep("homebBeforeAfter", "items", i, "beforeImg", v)} />
              <MediaField label="After Image" value={item.afterImg} onChange={v => updateDeep("homebBeforeAfter", "items", i, "afterImg", v)} />
            </div>
            <Field label="Caption (optional)" value={item.caption} onChange={v => updateDeep("homebBeforeAfter", "items", i, "caption", v)} />
          </div>
        ))}
        <button onClick={() => update("homebBeforeAfter", "items", [...items, { beforeImg: "", afterImg: "", caption: "" }])}
          className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2">
          <Plus className="w-4 h-4" /> Add before & after
        </button>
      </div>
    );
  }

  return null;
}