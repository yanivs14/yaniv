import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VideoSlider from "@/components/community/VideoSlider";
import CourseDetail from "@/components/community/CourseDetail";
import Forum from "@/components/community/Forum";

export default function Community() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { setAuthChecked(true); return; }
        const me = await base44.auth.me();
        setUser(me);
        setAuthChecked(true);
        try {
          const enrolls = await base44.entities.Enrollment.filter({ user_id: me.id });
          setEnrollments(enrolls);
        } catch {}
      } catch {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    base44.entities.Course.filter({ is_published: true }, "order", 100)
      .then(setCourses)
      .catch(() => {});
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-teal-700">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ברוכים הבאים ל-The Movement</h1>
          <p className="text-gray-600 mb-6">יש להתחבר כדי לגשת לקורסים ולקהילה שלך</p>
          <button
            onClick={() => base44.auth.redirectToLogin("/community")}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            התחברות
          </button>
        </div>
      </div>
    );
  }

  const enrolledCourseIds = enrollments.map((e) => e.course_id);
  const myCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const availableCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));
  const featuredCourses = courses.filter((c) => c.is_featured);
  const sliderCourses = featuredCourses.length > 0 ? featuredCourses : courses;

  const openCourse = (course) => {
    setSelectedCourse(course);
    setView("course");
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setView("home");
    setSelectedCourse(null);
    window.scrollTo(0, 0);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-2">
            <span className="font-bold text-xl text-gray-900">The Movement</span>
            <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium">LMS</span>
          </button>
          <nav className="flex items-center gap-1">
            <button
              onClick={goHome}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "home" || view === "course" ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              הקורסים שלי
            </button>
            <button
              onClick={() => { setView("forum"); setSelectedCourse(null); window.scrollTo(0, 0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "forum" ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              פורום תלמידים
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-sm font-bold text-teal-700">{user?.full_name?.[0]?.toUpperCase() || "U"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {view === "home" && (
        <>
          <VideoSlider courses={sliderCourses} onSelectCourse={openCourse} />
          <HomeContent
            myCourses={myCourses}
            availableCourses={availableCourses}
            onSelectCourse={openCourse}
            userName={user?.full_name}
          />
        </>
      )}
      {view === "course" && selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          isEnrolled={enrolledCourseIds.includes(selectedCourse.id)}
          onBack={goHome}
        />
      )}
      {view === "forum" && <Forum user={user} courses={courses} />}
    </div>
  );
}

function HomeContent({ myCourses, availableCourses, onSelectCourse, userName }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">שלום {userName?.split(" ")[0] || ""} 👋</h2>
        <p className="text-gray-500 mb-6">המשך מאיפה שעצרת</p>
        {myCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCourses.map((course) => (
              <CourseCard key={course.id} course={course} enrolled onClick={() => onSelectCourse(course)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">עדיין אין לך קורסים פעילים. הצצה לקטלוג למטה.</p>
          </div>
        )}
      </section>

      {availableCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">קטלוג קורסים</h2>
          <p className="text-gray-500 mb-6">כל הקורסים הזמינים</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={() => onSelectCourse(course)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CourseCard({ course, enrolled, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-right bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-teal-300 hover:shadow-md transition-all group"
    >
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📹</div>
        )}
        {enrolled && (
          <span className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">פעיל</span>
        )}
      </div>
      <div className="p-4">
        {course.category && (
          <span className="text-xs text-teal-600 font-medium uppercase tracking-wide">{course.category}</span>
        )}
        <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{course.title}</h3>
        {course.short_description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.short_description}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          {course.duration_label && <span>{course.duration_label}</span>}
          {course.duration_label && course.difficulty && <span>•</span>}
          {course.difficulty && <span>{difficultyLabel(course.difficulty)}</span>}
        </div>
      </div>
    </button>
  );
}

function difficultyLabel(d) {
  const map = { beginner: "מתחיל", intermediate: "בינוני", advanced: "מתקדם", all_levels: "כל הרמות" };
  return map[d] || d;
}