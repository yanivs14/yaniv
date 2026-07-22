import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LoadingSpinner, PageHeader, Bar } from "@/components/community/admin/AdminShared";
import { Trophy, BookOpen, MessageSquare, Calendar } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [courses, enrollments, topics, replies, users] = await Promise.all([
          base44.entities.Course.list(),
          base44.entities.Enrollment.list(),
          base44.entities.ForumTopic.list("-created_date", 200),
          base44.entities.ForumReply.list("-created_date", 200),
          base44.entities.User.list(),
        ]);

        // Enrollment by course
        const activeEnrolls = enrollments.filter(e => e.status === "active");
        const courseEnrollMap = {};
        activeEnrolls.forEach(e => { courseEnrollMap[e.course_id] = (courseEnrollMap[e.course_id] || 0) + 1; });
        const courseBreakdown = courses.map(c => ({ title: c.title, count: courseEnrollMap[c.id] || 0 })).sort((a, b) => b.count - a.count);
        const maxCourseEnroll = Math.max(1, ...courseBreakdown.map(c => c.count));

        // Forum activity by user
        const userActivity = {};
        topics.forEach(t => { const n = t.author_name; if (n) { if (!userActivity[n]) userActivity[n] = { name: n, topics: 0, replies: 0 }; userActivity[n].topics++; } });
        replies.forEach(r => { const n = r.author_name; if (n) { if (!userActivity[n]) userActivity[n] = { name: n, topics: 0, replies: 0 }; userActivity[n].replies++; } });
        const topUsers = Object.values(userActivity).map(a => ({ ...a, total: a.topics + a.replies })).sort((a, b) => b.total - a.total).slice(0, 10);
        const maxActivity = Math.max(1, ...topUsers.map(u => u.total));

        // User registration by month
        const monthMap = {};
        users.forEach(u => {
          if (u.created_date) {
            const d = new Date(u.created_date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
          }
        });
        const monthKeys = Object.keys(monthMap).sort();
        const registrationTimeline = monthKeys.slice(-6).map(k => ({ month: k, count: monthMap[k] }));
        const maxMonthReg = Math.max(1, ...registrationTimeline.map(r => r.count));

        // Status breakdown
        const statusBreakdown = {
          active: enrollments.filter(e => e.status === "active").length,
          expired: enrollments.filter(e => e.status === "expired").length,
          cancelled: enrollments.filter(e => e.status === "cancelled").length,
        };

        setData({ courseBreakdown, maxCourseEnroll, topUsers, maxActivity, registrationTimeline, maxMonthReg, statusBreakdown, totalEnrollments: enrollments.length });
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Detailed breakdowns and statistics" />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Enrollment by Course */}
        <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-[#1D2120]" />
            <h3 className="font-bold text-[#1D2120]">Enrollments by Course</h3>
          </div>
          {data.courseBreakdown.length > 0 ? (
            <div className="space-y-4">
              {data.courseBreakdown.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#1D2120] truncate">{c.title}</span>
                    <span className="text-sm text-[#6B6B6B] flex-shrink-0 ml-2">{c.count}</span>
                  </div>
                  <Bar value={c.count} max={data.maxCourseEnroll} />
                </div>
              ))}
            </div>
          ) : <p className="text-[#6B6B6B] text-sm">No enrollments yet.</p>}
        </div>

        {/* Forum Activity Leaderboard */}
        <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-[#1D2120]" />
            <h3 className="font-bold text-[#1D2120]">Top Forum Contributors</h3>
          </div>
          {data.topUsers.length > 0 ? (
            <div className="space-y-3">
              {data.topUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < 3 ? "bg-[#D4F658] text-[#1D2120]" : "bg-[#1D2120]/5 text-[#6B6B6B]"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1D2120] truncate">{u.name}</span>
                      <span className="text-xs text-[#6B6B6B] flex-shrink-0 ml-2">{u.total} posts</span>
                    </div>
                    <Bar value={u.total} max={data.maxActivity} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-[#6B6B6B] text-sm">No forum activity yet.</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Registration Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-[#1D2120]" />
            <h3 className="font-bold text-[#1D2120]">User Registration (Last 6 Months)</h3>
          </div>
          {data.registrationTimeline.length > 0 ? (
            <div className="space-y-3">
              {data.registrationTimeline.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#1D2120]">{r.month}</span>
                    <span className="text-sm text-[#6B6B6B]">{r.count} users</span>
                  </div>
                  <Bar value={r.count} max={data.maxMonthReg} />
                </div>
              ))}
            </div>
          ) : <p className="text-[#6B6B6B] text-sm">No registration data.</p>}
        </div>

        {/* Enrollment Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-[#1D2120]" />
            <h3 className="font-bold text-[#1D2120]">Enrollment Status Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-[#1D2120]">Active</span><span className="text-sm text-[#6B6B6B]">{data.statusBreakdown.active}</span></div>
              <Bar value={data.statusBreakdown.active} max={Math.max(1, data.totalEnrollments)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-[#1D2120]">Expired</span><span className="text-sm text-[#6B6B6B]">{data.statusBreakdown.expired}</span></div>
              <Bar value={data.statusBreakdown.expired} max={Math.max(1, data.totalEnrollments)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-[#1D2120]">Cancelled</span><span className="text-sm text-[#6B6B6B]">{data.statusBreakdown.cancelled}</span></div>
              <Bar value={data.statusBreakdown.cancelled} max={Math.max(1, data.totalEnrollments)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}