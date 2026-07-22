import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, PlayCircle, UserCheck, MessageSquare, Users, TrendingUp } from "lucide-react";
import { LoadingSpinner, StatCard, PageHeader, Bar } from "@/components/community/admin/AdminShared";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [courses, lessons, enrollments, topics, replies, users] = await Promise.all([
          base44.entities.Course.list(),
          base44.entities.Lesson.list(),
          base44.entities.Enrollment.list(),
          base44.entities.ForumTopic.list("-created_date", 200),
          base44.entities.ForumReply.list("-created_date", 200),
          base44.entities.User.list(),
        ]);
        const activeEnrolls = enrollments.filter(e => e.status === "active");
        const courseEnrollCounts = {};
        activeEnrolls.forEach(e => { courseEnrollCounts[e.course_id] = (courseEnrollCounts[e.course_id] || 0) + 1; });
        const topCourses = courses
          .map(c => ({ title: c.title, count: courseEnrollCounts[c.id] || 0 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        const maxCount = topCourses[0]?.count || 1;
        setStats({ courses: courses.length, lessons: lessons.length, enrollments: activeEnrolls.length, topics: topics.length, replies: replies.length, users: users.length, topCourses, maxCount });
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your LMS platform" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Courses" value={stats.courses} icon={BookOpen} />
        <StatCard label="Lessons" value={stats.lessons} icon={PlayCircle} />
        <StatCard label="Active Enrollments" value={stats.enrollments} icon={UserCheck} />
        <StatCard label="Forum Topics" value={stats.topics} icon={MessageSquare} />
        <StatCard label="Forum Replies" value={stats.replies} icon={MessageSquare} />
        <StatCard label="Users" value={stats.users} icon={Users} />
      </div>
      <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-[#1D2120]" />
          <h3 className="font-bold text-[#1D2120]">Top Courses by Enrollment</h3>
        </div>
        {stats.topCourses.length > 0 ? (
          <div className="space-y-4">
            {stats.topCourses.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#1D2120]">{c.title}</span>
                  <span className="text-sm text-[#6B6B6B]">{c.count} enrolled</span>
                </div>
                <Bar value={c.count} max={stats.maxCount} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B6B6B] text-sm">No enrollments yet.</p>
        )}
      </div>
    </div>
  );
}