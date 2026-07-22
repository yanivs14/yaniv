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
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1D2120]/10 border-t-[#D4F658] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#D4F658] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-[#1D2120]">M</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1D2120] mb-3" style={{ fontFamily: "'Times New Roman', serif" }}>ברוכים הבאים</h1>
          <p className="text-[#6B6B6B] mb-8 text-lg">יש להתחבר כדי לגשת לקורסים ולקהילה שלך</p>
          <button
            onClick={() => base44.auth.redirectToLogin("/community")}
            className="bg-[#D4F658] text-[#1D2120] px-8 py-3.5 rounded-xl font-bold hover:bg-[#c4e64a] transition-colors"
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

  const firstName = user?.full_name?.split(" ")[0] || "";

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F5F3]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#F5F5F3]/80 backdrop-blur-xl border-b border-[#1D2120]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#1D2120]" style={{ fontFamily: "'Times New Roman', serif" }}>The Movement</span>
            <span className="text-[10px] text-[#1D2120] bg-[#D4F658] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">LMS</span>
          </button>
          <nav className="flex items-center gap-2">
            <button
              onClick={goHome}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                view === "home" || view === "course"
                  ? "bg-[#1D2120] text-[#D4F658]"
                  : "text-[#6B6B6B] hover:bg-[#1D2120]/5"
              }`}
            >
              הקורסים שלי
            </button>
            <button
              onClick={() => { setView("forum"); setSelectedCourse(null); window.scrollTo(0, 0); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                view === "forum"
                  ? "bg-[#1D2120] text-[#D4F658]"
                  : "text-[#6B6B6B] hover:bg-[#1D2120]/5"
              }`}
            >
              פורום תלמידים
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4F658] flex items-center justify-center">
              <span className="text-sm font-bold text-[#1D2120]">{user?.full_name?.[0]?.toUpperCase() || "U"}</span>
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
            userName={firstName}
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
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
      {/* My Courses */}
      <section className="mb-20">
        <div className="mb-8">
          <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">תוכן מותאם אישית</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: "'Times New Roman', serif" }}>
            שלום {userName}
          </h2>
          <p className="text-[#6B6B6B] text-lg mt-2">המשך מאיפה שעצרת</p>
        </div>
        {myCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <CourseCard key={course.id} course={course} enrolled onClick={() => onSelectCourse(course)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#1D2120]/5">
            <p className="text-[#6B6B6B] text-lg">עדיין אין לך קורסים פעילים. הצצה לקטלוג למטה.</p>
          </div>
        )}
      </section>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <section>
          <div className="mb-8">
            <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">קטלוג מלא</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: "'Times New Roman', serif" }}>
              קורסים זמינים
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      className="text-right bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="aspect-[16/10] bg-[#1D2120] relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#D4F658]/30 text-5xl">📹</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D2120]/60 to-transparent" />
        {enrolled && (
          <span className="absolute top-4 right-4 bg-[#D4F658] text-[#1D2120] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">פעיל</span>
        )}
      </div>
      <div className="p-6">
        {course.category && (
          <span className="text-xs text-[#1D2120] font-bold uppercase tracking-widest">{course.category}</span>
        )}
        <h3 className="text-xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: "'Times New Roman', serif" }}>{course.title}</h3>
        {course.short_description && (
          <p className="text-[#6B6B6B] text-sm mt-2 leading-relaxed line-clamp-2">{course.short_description}</p>
        )}
        <div className="flex items-center gap-3 mt-4 text-xs text-[#6B6B6B]">
          {course.instructor && <span className="font-medium">{course.instructor}</span>}
          {course.instructor && course.duration_label && <span>•</span>}
          {course.duration_label && <span>{course.duration_label}</span>}
        </div>
      </div>
    </button>
  );
}