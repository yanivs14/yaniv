import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, PlayCircle, UserCheck, MessageSquare, Users, BarChart3, Menu, X, ArrowLeft } from "lucide-react";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "lessons", label: "Lessons", icon: PlayCircle },
  { id: "enrollments", label: "Enrollments", icon: UserCheck },
  { id: "forum", label: "Forum", icon: MessageSquare },
  { id: "users", label: "Users", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar({ activeTab, onTabChange, sidebarOpen, setSidebarOpen, user }) {
  return (
    <>
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#1D2120] z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4F658] flex items-center justify-center">
                <span className="font-bold text-[#1D2120]">M</span>
              </div>
              <div>
                <p className="text-white font-bold" style={{ fontFamily: FONT_HEADING }}>The Movement</p>
                <p className="text-white/40 text-xs">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-[#D4F658] text-[#1D2120]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-[#D4F658] flex items-center justify-center">
                <span className="text-sm font-bold text-[#1D2120]">{user?.full_name?.[0]?.toUpperCase() || "A"}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-white/40 text-xs">{user?.email}</p>
              </div>
            </div>
            <Link to="/community" className="flex items-center gap-2 text-white/40 hover:text-white text-sm px-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Community</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}