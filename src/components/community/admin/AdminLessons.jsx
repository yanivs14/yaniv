import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Lock, Eye } from "lucide-react";
import { LoadingSpinner, PageHeader, FormField, TextInput, TextArea, Select, Toggle } from "@/components/community/admin/AdminShared";
import MediaUpload from "@/components/community/admin/MediaUpload";

export default function AdminLessons() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    base44.entities.Course.list("order", 100).then(c => {
      setCourses(c);
      if (c.length > 0) setSelectedCourse(c[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    base44.entities.Lesson.filter({ course_id: selectedCourse }, "order", 200).then(setLessons).catch(() => {});
  }, [selectedCourse]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this lesson?")) return;
    await base44.entities.Lesson.delete(id);
    base44.entities.Lesson.filter({ course_id: selectedCourse }, "order", 200).then(setLessons);
  };

  if (showForm || editing) {
    return <LessonForm lesson={editing} courseId={selectedCourse} courses={courses} onClose={() => { setShowForm(false); setEditing(null); base44.entities.Lesson.filter({ course_id: selectedCourse }, "order", 200).then(setLessons); }} />;
  }

  return (
    <div>
      <PageHeader title="Lessons" subtitle="Manage course content" action={
        <button onClick={() => setShowForm(true)} disabled={!selectedCourse} className="flex items-center gap-2 bg-[#D4F658] text-[#1D2120] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c4e64a] transition-colors disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Lesson
        </button>
      } />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="mb-6">
            <Select value={selectedCourse || ""} onChange={(e) => setSelectedCourse(e.target.value)}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </div>
          {lessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#1D2120]/5">
              <p className="text-[#6B6B6B]">No lessons in this course yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((l, i) => (
                <div key={l.id} className="bg-white rounded-2xl p-4 border border-[#1D2120]/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1D2120]/5 flex items-center justify-center flex-shrink-0">
                    {l.is_preview ? <Eye className="w-5 h-5 text-[#D4F658]" /> : <Lock className="w-5 h-5 text-[#6B6B6B]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B6B6B] font-bold">{i + 1}.</span>
                      <h3 className="font-bold text-[#1D2120] truncate">{l.title}</h3>
                      {l.is_preview && <span className="text-[10px] bg-[#D4F658] text-[#1D2120] px-2 py-0.5 rounded-full font-bold uppercase">Preview</span>}
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">{l.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#6B6B6B]">
                      {l.module && <span>{l.module}</span>}
                      {l.duration && <span>• {l.duration}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditing(l)} className="flex items-center justify-center w-9 h-9 bg-[#1D2120]/5 text-[#1D2120] rounded-lg hover:bg-[#1D2120]/10">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(l.id)} className="flex items-center justify-center w-9 h-9 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LessonForm({ lesson, courseId, courses, onClose }) {
  const [form, setForm] = useState({
    course_id: lesson?.course_id || courseId || "", title: lesson?.title || "", description: lesson?.description || "",
    video_url: lesson?.video_url || "", thumbnail_url: lesson?.thumbnail_url || "", duration: lesson?.duration || "",
    module: lesson?.module || "", order: lesson?.order || 0, is_preview: lesson?.is_preview || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.course_id) { setError("Course is required"); return; }
    setSaving(true); setError("");
    try {
      if (lesson) await base44.entities.Lesson.update(lesson.id, form);
      else await base44.entities.Lesson.create(form);
      onClose();
    } catch (e) { setError(e.message || "Failed to save"); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title={lesson ? "Edit Lesson" : "New Lesson"} action={
        <button onClick={onClose} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] text-sm font-medium">
          <X className="w-4 h-4" /> Cancel
        </button>
      } />
      <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5 space-y-4 max-w-2xl">
        <FormField label="Course">
          <Select value={form.course_id} onChange={(e) => set("course_id", e.target.value)}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </FormField>
        <FormField label="Title"><TextInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Lesson title" /></FormField>
        <FormField label="Description"><TextArea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Lesson description" /></FormField>
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Module"><TextInput value={form.module} onChange={(e) => set("module", e.target.value)} placeholder="e.g. Week 1" /></FormField>
          <FormField label="Duration"><TextInput value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 12:30" /></FormField>
          <FormField label="Order"><TextInput type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} /></FormField>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 pt-2">
          <MediaUpload label="Video" value={form.video_url} onChange={(v) => set("video_url", v)} type="video" />
          <MediaUpload label="Thumbnail" value={form.thumbnail_url} onChange={(v) => set("thumbnail_url", v)} type="image" />
        </div>
        <div className="pt-4 border-t border-[#1D2120]/5">
          <Toggle checked={form.is_preview} onChange={(v) => set("is_preview", v)} label="Free Preview Lesson" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={handleSave} disabled={saving} className="w-full bg-[#1D2120] text-[#D4F658] py-3 rounded-xl font-bold hover:bg-[#2a302e] disabled:opacity-50">
          {saving ? "Saving..." : lesson ? "Save Changes" : "Create Lesson"}
        </button>
      </div>
    </div>
  );
}