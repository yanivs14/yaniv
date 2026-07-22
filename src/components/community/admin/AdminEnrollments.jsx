import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, X, Search } from "lucide-react";
import { LoadingSpinner, PageHeader, FormField, Select } from "@/components/community/admin/AdminShared";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const [e, u, c] = await Promise.all([
        base44.entities.Enrollment.list("-created_date", 200),
        base44.entities.User.list(),
        base44.entities.Course.list(),
      ]);
      setEnrollments(e); setUsers(u); setCourses(c);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Revoke this enrollment?")) return;
    await base44.entities.Enrollment.delete(id);
    load();
  };

  const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const filtered = enrollments.filter(e => {
    if (filterCourse && e.course_id !== filterCourse) return false;
    if (search) {
      const u = userMap[e.user_id];
      const name = u?.full_name || e.user_email || "";
      if (!name.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  if (showForm) {
    return <EnrollmentForm users={users} courses={courses} onClose={() => { setShowForm(false); load(); }} />;
  }

  return (
    <div>
      <PageHeader title="Enrollments" subtitle="Manage student access to courses" action={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#D4F658] text-[#1D2120] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c4e64a] transition-colors">
          <Plus className="w-4 h-4" /> Grant Access
        </button>
      } />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 border border-[#1D2120]/10 rounded-xl text-sm focus:outline-none focus:border-[#D4F658] bg-white" />
            </div>
            <Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="sm:w-64">
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#1D2120]/5">
              <p className="text-[#6B6B6B]">No enrollments found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#1D2120]/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1D2120]/5 text-left text-xs text-[#6B6B6B] uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">Course</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => {
                      const u = userMap[e.user_id];
                      return (
                        <tr key={e.id} className="border-b border-[#1D2120]/5 last:border-0">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#1D2120]">{u?.full_name || "Unknown"}</p>
                            <p className="text-xs text-[#6B6B6B]">{e.user_email || u?.email}</p>
                            <p className="text-xs text-[#6B6B6B] sm:hidden mt-1">{courseMap[e.course_id] || "—"}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#1D2120] hidden sm:table-cell">{courseMap[e.course_id] || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${e.status === "active" ? "bg-[#D4F658] text-[#1D2120]" : "bg-[#1D2120]/5 text-[#6B6B6B]"}`}>{e.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete(e.id)} className="flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EnrollmentForm({ users, courses, onClose }) {
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!userId || !courseId) { setError("Please select a user and course"); return; }
    setSaving(true); setError("");
    try {
      const u = users.find(x => x.id === userId);
      const c = courses.find(x => x.id === courseId);
      await base44.entities.Enrollment.create({
        user_id: userId, user_email: u?.email || "", course_id: courseId,
        stripe_product_id: c?.stripe_product_id || "", status,
      });
      onClose();
    } catch (e) { setError(e.message || "Failed to create enrollment"); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="Grant Course Access" action={
        <button onClick={onClose} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] text-sm font-medium">
          <X className="w-4 h-4" /> Cancel
        </button>
      } />
      <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5 space-y-4 max-w-lg">
        <FormField label="Student">
          <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Select a user...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
          </Select>
        </FormField>
        <FormField label="Course">
          <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Select a course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
          </Select>
        </FormField>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={handleSave} disabled={saving} className="w-full bg-[#1D2120] text-[#D4F658] py-3 rounded-xl font-bold hover:bg-[#2a302e] disabled:opacity-50">
          {saving ? "Saving..." : "Grant Access"}
        </button>
      </div>
    </div>
  );
}