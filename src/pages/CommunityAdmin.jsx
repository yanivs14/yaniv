import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Menu, Lock, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/community/admin/AdminSidebar";
import AdminDashboard from "@/components/community/admin/AdminDashboard";
import AdminCourses from "@/components/community/admin/AdminCourses";
import AdminLessons from "@/components/community/admin/AdminLessons";
import AdminEnrollments from "@/components/community/admin/AdminEnrollments";
import AdminForum from "@/components/community/admin/AdminForum";
import AdminUsers from "@/components/community/admin/AdminUsers";
import AdminAnalytics from "@/components/community/admin/AdminAnalytics";

const FONT_BODY = "'Heebo', system-ui, sans-serif";
const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

export default function CommunityAdmin() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { setAuthChecked(true); return; }
        const me = await base44.auth.me();
        setUser(me);
        setAuthChecked(true);
      } catch {
        setAuthChecked(true);
      }
    })();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center" style={{ fontFamily: FONT_BODY }}>
        <div className="w-8 h-8 border-4 border-[#1D2120]/10 border-t-[#D4F658] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-4" style={{ fontFamily: FONT_BODY }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#D4F658] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#1D2120]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1D2120] mb-3" style={{ fontFamily: FONT_HEADING }}>Admin Access</h1>
          <p className="text-[#6B6B6B] mb-8 text-lg">Sign in with an admin account to access the management panel</p>
          <button onClick={() => base44.auth.redirectToLogin("/community-admin")} className="bg-[#D4F658] text-[#1D2120] px-8 py-3.5 rounded-xl font-bold hover:bg-[#c4e64a] transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-4" style={{ fontFamily: FONT_BODY }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-[#1D2120] mb-3" style={{ fontFamily: FONT_HEADING }}>Access Denied</h1>
          <p className="text-[#6B6B6B] mb-8 text-lg">You don't have admin permissions to access this page</p>
          <Link to="/community" className="inline-block bg-[#1D2120] text-[#D4F658] px-8 py-3.5 rounded-xl font-bold hover:bg-[#2a302e] transition-colors">Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3]" style={{ fontFamily: FONT_BODY }}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
      <div className="lg:ml-72">
        <div className="p-4 lg:p-8">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-white border border-[#1D2120]/5">
              <Menu className="w-5 h-5 text-[#1D2120]" />
            </button>
            <span className="font-bold text-[#1D2120]" style={{ fontFamily: FONT_HEADING }}>Admin Panel</span>
            <div className="w-9" />
          </div>
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "courses" && <AdminCourses />}
          {activeTab === "lessons" && <AdminLessons />}
          {activeTab === "enrollments" && <AdminEnrollments />}
          {activeTab === "forum" && <AdminForum />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "analytics" && <AdminAnalytics />}
        </div>
      </div>
    </div>
  );
}