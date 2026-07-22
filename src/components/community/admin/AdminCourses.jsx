import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { LoadingSpinner, PageHeader, FormField, TextInput, TextArea, Select, Toggle } from "@/components/community/admin/AdminShared";
import MediaUpload from "@/components/community/admin/MediaUpload";

const STRIPE_PRODUCTS = [
  { id: "", label: "None" },
  { id: "prod_UuiIaTI9AZDeaI", label: "Handstand 4 Life ($197)" },
  { id: "prod_Ur0zb6II7prw6R", label: "The Handstand Journey ($149/$99)" },
  { id: "prod_UqpRMlAEOZ9sFh", label: "Master the Handstand — Pre-Launch" },
  { id: "prod_UncfKiOsLiEBJV", label: "Handstand Course ($97)" },
  { id: "prod_UlqMgbiclwDM6Z", label: "The Movement Membership" },
  { id: "prod_UqkK3PJnR5XdZn", label: "12 Months - Inner Circle ($5000)" },
  { id: "prod_UqkJwt3jGxJA9h", label: "Inner Circle 6 Months ($2700/$3000)" },
  { id: "prod_UqjkSLEQgDUgpn", label: "Inner Circle: 3 Months ($1500)" },
];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { setCourses(await base44.entities.Course.list("order", 100)); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    await base44.entities.Course.delete(id);
    load();
  };

  if (showForm || editing) {
    return <CourseForm course={editing} onClose={() => { setShowForm(false); setEditing(null); load(); }} />;
  }

  return (
    <div>
      <PageHeader title="Courses" subtitle="Manage your course catalog" action={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#D4F658] text-[#1D2120] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c4e64a] transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      } />
      {loading ? <LoadingSpinner /> : courses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#1D2120]/5">
          <p className="text-[#6B6B6B]">No courses yet. Click "Add Course" to create one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <div key={c.id} className="bg-white rounded-2xl overflow-hidden border border-[#1D2120]/5">
              <div className="aspect-video bg-[#1D2120] relative">
                {c.thumbnail_url && <img src={c.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {c.is_featured && <span className="text-[10px] bg-[#D4F658] text-[#1D2120] px-2 py-1 rounded-full font-bold uppercase">Featured</span>}
                  {c.is_inner_circle && <span className="text-[10px] bg-[#1D2120] text-[#D4F658] px-2 py-1 rounded-full font-bold uppercase">Inner Circle</span>}
                  {!c.is_published && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold uppercase">Draft</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">{c.category || "Uncategorized"}</p>
                <h3 className="font-bold text-[#1D2120] mt-1">{c.title}</h3>
                <p className="text-xs text-[#6B6B6B] mt-1">{c.instructor} • {c.duration_label || "—"}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(c)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#1D2120]/5 text-[#1D2120] py-2 rounded-lg text-xs font-bold hover:bg-[#1D2120]/10">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center w-9 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseForm({ course, onClose }) {
  const [form, setForm] = useState({
    title: course?.title || "", short_description: course?.short_description || "", description: course?.description || "",
    thumbnail_url: course?.thumbnail_url || "", preview_video_url: course?.preview_video_url || "", category: course?.category || "",
    stripe_product_id: course?.stripe_product_id || "", instructor: course?.instructor || "", difficulty: course?.difficulty || "all_levels",
    duration_label: course?.duration_label || "", order: course?.order || 0, is_published: course?.is_published ?? true,
    is_featured: course?.is_featured || false, is_inner_circle: course?.is_inner_circle || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      if (course) await base44.entities.Course.update(course.id, form);
      else await base44.entities.Course.create(form);
      onClose();
    } catch (e) { setError(e.message || "Failed to save"); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title={course ? "Edit Course" : "New Course"} action={
        <button onClick={onClose} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] text-sm font-medium">
          <X className="w-4 h-4" /> Cancel
        </button>
      } />
      <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5 space-y-4 max-w-2xl">
        <FormField label="Title"><TextInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Course title" /></FormField>
        <FormField label="Short Description"><TextInput value={form.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="Brief description for cards" /></FormField>
        <FormField label="Full Description"><TextArea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Full course description" /></FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Category"><TextInput value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Handstand" /></FormField>
          <FormField label="Instructor"><TextInput value={form.instructor} onChange={(e) => set("instructor", e.target.value)} placeholder="Instructor name" /></FormField>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Difficulty">
            <Select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              <option value="all_levels">All Levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </Select>
          </FormField>
          <FormField label="Duration"><TextInput value={form.duration_label} onChange={(e) => set("duration_label", e.target.value)} placeholder="e.g. 8 weeks" /></FormField>
          <FormField label="Order"><TextInput type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} /></FormField>
        </div>
        <FormField label="Stripe Product (for enrollment matching)">
          <Select value={form.stripe_product_id} onChange={(e) => set("stripe_product_id", e.target.value)}>
            {STRIPE_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
        </FormField>
        <div className="grid sm:grid-cols-2 gap-6 pt-2">
          <MediaUpload label="Thumbnail Image" value={form.thumbnail_url} onChange={(v) => set("thumbnail_url", v)} type="image" />
          <MediaUpload label="Preview Video" value={form.preview_video_url} onChange={(v) => set("preview_video_url", v)} type="video" />
        </div>
        <div className="flex flex-wrap gap-6 pt-4 border-t border-[#1D2120]/5">
          <Toggle checked={form.is_published} onChange={(v) => set("is_published", v)} label="Published" />
          <Toggle checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" />
          <Toggle checked={form.is_inner_circle} onChange={(v) => set("is_inner_circle", v)} label="Inner Circle" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={handleSave} disabled={saving} className="w-full bg-[#1D2120] text-[#D4F658] py-3 rounded-xl font-bold hover:bg-[#2a302e] disabled:opacity-50">
          {saving ? "Saving..." : course ? "Save Changes" : "Create Course"}
        </button>
      </div>
    </div>
  );
}