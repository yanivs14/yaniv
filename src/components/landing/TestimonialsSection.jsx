import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Play, Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { base44 } from "@/api/base44Client";

function TestimonialCard({ t, onEdit, onDelete, isAdmin }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef();

  const handleMediaClick = () => {
    if (t.videoUrl) {
      setPlaying(true);
      setTimeout(() => videoRef.current?.play(), 50);
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden flex-shrink-0 w-72 sm:w-80 snap-start">
      <div className="aspect-[3/4] overflow-hidden relative cursor-pointer" onClick={handleMediaClick}>
        {t.videoUrl ? (
          <>
            {!playing ? (
              <>
                <img src={t.img || t.videoUrl} alt={t.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-14 h-14 bg-orange-red rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-dark-bg fill-dark-bg ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <video ref={videoRef} src={t.videoUrl} className="w-full h-full object-cover" controls playsInline />
            )}
          </>
        ) : (
          <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-5">
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-orange-red text-orange-red" />)}
        </div>
        <p className="font-body text-sm text-off-white/80 leading-relaxed mb-4">"{t.quote}"</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-heading text-lg font-bold text-off-white uppercase tracking-tight">{t.name}</p>
            <p className="font-body text-xs text-white-muted">{t.role}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <button onClick={onEdit} className="p-1.5 rounded-lg bg-dark-bg text-white-muted hover:text-orange-red transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg bg-dark-bg text-white-muted hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditModal({ item, index, onSave, onClose }) {
  const [form, setForm] = useState({ ...item });
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file, isVideo) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    if (isVideo) setForm(f => ({ ...f, videoUrl: file_url, img: "" }));
    else setForm(f => ({ ...f, img: file_url, videoUrl: "" }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-heading text-xl font-bold text-off-white uppercase">{index === -1 ? "Add Testimonial" : "Edit Testimonial"}</p>
          <button onClick={onClose} className="text-white-muted hover:text-off-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <input value={form.role || ""} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Role / Age"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red" />
          <textarea value={form.quote || ""} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="Quote" rows={3}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red resize-none" />
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-white-muted hover:border-orange-red transition-colors">
              {uploading ? <div className="w-3 h-3 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Photo
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], false)} />
            </label>
            <label className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-white-muted hover:border-orange-red transition-colors">
              {uploading ? <div className="w-3 h-3 border-2 border-orange-red border-t-transparent rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Video
              <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], true)} />
            </label>
          </div>
          {form.img && !form.videoUrl && <img src={form.img} className="w-full h-32 object-cover rounded-lg" />}
          {form.videoUrl && <video src={form.videoUrl} className="w-full h-32 object-cover rounded-lg" muted />}
        </div>
        <button onClick={() => onSave(form)}
          className="w-full mt-5 bg-orange-red text-dark-bg font-body text-sm font-bold py-3 rounded-full hover:bg-orange-red-hover transition-colors">
          Save
        </button>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { content, update } = useSiteContent();
  const c = content.testimonials;
  const scrollRef = useRef();
  const [editItem, setEditItem] = useState(null); // { item, index }
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === "admin")).catch(() => {});
  }, []);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const saveItem = (form) => {
    const items = [...c.items];
    if (editItem.index === -1) items.push(form);
    else items[editItem.index] = form;
    update("testimonials", "items", items);
    setEditItem(null);
  };

  const deleteItem = (i) => {
    update("testimonials", "items", c.items.filter((_, idx) => idx !== i));
  };

  return (
    <section className="py-20 lg:py-32 bg-dark-bg" id="results">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <p className="font-body text-sm text-white-muted uppercase tracking-widest mb-4">{c.eyebrow}</p>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] text-off-white uppercase tracking-tight">
              {c.headline1}<br />
              <span className="text-orange-red">{c.headlineAccent}</span>
            </h2>
            <p className="mt-4 font-body text-base text-white-muted max-w-lg leading-relaxed">{c.subtitle}</p>
          </div>
          <div className="hidden sm:flex gap-2 flex-shrink-0">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-surface flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-surface flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Slider */}
        <div className="relative">
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {c.items.map((t, i) => (
              <TestimonialCard
                key={i}
                t={t}
                isAdmin={isAdmin}
                onEdit={() => setEditItem({ item: t, index: i })}
                onDelete={() => deleteItem(i)}
              />
            ))}
            {isAdmin && (
              <button
                onClick={() => setEditItem({ item: { name: "", role: "", quote: "", img: "", videoUrl: "" }, index: -1 })}
                className="flex-shrink-0 w-72 sm:w-80 snap-start rounded-2xl border-2 border-dashed border-dark-border flex flex-col items-center justify-center gap-3 text-white-muted hover:border-orange-red hover:text-orange-red transition-colors min-h-[400px]"
              >
                <Plus className="w-8 h-8" />
                <span className="font-body text-sm">Add testimonial</span>
              </button>
            )}
          </div>
          {/* Mobile arrows */}
          <div className="flex sm:hidden justify-center gap-3 mt-4">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-surface flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-dark-border bg-dark-surface flex items-center justify-center text-white-muted hover:border-orange-red hover:text-orange-red transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 border-t border-dark-border pt-12 mt-12">
          {c.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-5xl lg:text-6xl font-bold text-orange-red">{stat.value}</div>
              <p className="mt-2 font-body text-sm text-white-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {editItem && (
        <EditModal
          item={editItem.item}
          index={editItem.index}
          onSave={saveItem}
          onClose={() => setEditItem(null)}
        />
      )}
    </section>
  );
}