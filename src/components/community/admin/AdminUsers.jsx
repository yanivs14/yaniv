import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Ban, Shield, BookOpen, MessageSquare } from "lucide-react";
import { LoadingSpinner, PageHeader, Toggle, Bar } from "@/components/community/admin/AdminShared";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [replies, setReplies] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const [u, t, r, e] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.ForumTopic.list("-created_date", 200),
        base44.entities.ForumReply.list("-created_date", 200),
        base44.entities.Enrollment.list(),
      ]);
      setUsers(u); setTopics(t); setReplies(r); setEnrollments(e);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const activity = {};
  topics.forEach(t => { if (t.author_id) activity[t.author_id] = (activity[t.author_id] || 0) + 1; });
  replies.forEach(r => { if (r.author_id) activity[r.author_id] = (activity[r.author_id] || 0) + 1; });
  const enrollCount = {};
  enrollments.forEach(e => { if (e.status === "active") enrollCount[e.user_id] = (enrollCount[e.user_id] || 0) + 1; });

  const maxActivity = Math.max(1, ...Object.values(activity));

  const filtered = users.filter(u => !search || (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()));

  const updateUser = async (id, data) => {
    try { await base44.entities.User.update(id, data); load(); } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage permissions and view activity" />
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 border border-[#1D2120]/10 rounded-xl text-sm focus:outline-none focus:border-[#D4F658] bg-white" />
      </div>
      <div className="space-y-3">
        {filtered.map(u => {
          const act = activity[u.id] || 0;
          const enr = enrollCount[u.id] || 0;
          return (
            <div key={u.id} className="bg-white rounded-2xl p-5 border border-[#1D2120]/5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${u.role === "admin" ? "bg-[#D4F658]" : "bg-[#1D2120]/5"}`}>
                  <span className={`text-sm font-bold ${u.role === "admin" ? "text-[#1D2120]" : "text-[#6B6B6B]"}`}>{u.full_name?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#1D2120]">{u.full_name}</p>
                    {u.role === "admin" && <span className="text-[10px] bg-[#1D2120] text-[#D4F658] px-2 py-0.5 rounded-full font-bold uppercase">Admin</span>}
                    {u.is_banned && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Banned</span>}
                  </div>
                  <p className="text-xs text-[#6B6B6B]">{u.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#6B6B6B]">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {enr} courses</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {act} posts</span>
                  </div>
                  {act > 0 && <div className="mt-2 max-w-xs"><Bar value={act} max={maxActivity} /></div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 lg:gap-6 mt-4 pt-4 border-t border-[#1D2120]/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6B6B6B]" />
                  <Toggle checked={u.role === "admin"} onChange={(v) => updateUser(u.id, { role: v ? "admin" : "user" })} label="Admin" />
                </div>
                <Toggle checked={u.is_instructor || false} onChange={(v) => updateUser(u.id, { is_instructor: v })} label="Instructor" />
                <Toggle checked={u.is_moderator || false} onChange={(v) => updateUser(u.id, { is_moderator: v })} label="Moderator" />
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-[#6B6B6B]" />
                  <Toggle checked={u.is_banned || false} onChange={(v) => updateUser(u.id, { is_banned: v })} label="Banned" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="bg-white rounded-2xl p-12 text-center border border-[#1D2120]/5"><p className="text-[#6B6B6B]">No users found.</p></div>}
      </div>
    </div>
  );
}