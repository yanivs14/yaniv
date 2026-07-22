import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VideoSlider from "@/components/community/VideoSlider";
import CourseDetail from "@/components/community/CourseDetail";
import Forum from "@/components/community/Forum";
import InnerCircle from "@/components/community/InnerCircle";
import CourseCard from "@/components/community/CourseCard";

const INNER_CIRCLE_PRODUCTS = ["prod_UqkK3PJnR5XdZn", "prod_UqkJwt3jGxJA9h", "prod_UqjkSLEQgDUgpn"];
const FONT_BODY = "'Heebo', system-ui, sans-serif";
const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

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
            <span className="text-2xl font-bold text-[#1D2120]">M</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1D2120] mb-3" style={{ fontFamily: FONT_HEADING }}>Welcome</h1>
          <p className="text-[#6B6B6B] mb-8 text-lg">Sign in to access your courses and community</p>
          <button
            onClick={() => base44.auth.redirectToLogin("/community")}
            className="bg-[#D4F658] text-[#1D2120] px-8 py-3.5 rounded-xl font-bold hover:bg-[#c4e64a] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const hasInnerCircle = enrollments.some(e => INNER_CIRCLE_PRODUCTS.includes(e.stripe_product_id)) || user?.role === "admin";
  const enrolledCourseIds = enrollments.map((e) => e.course_id);
  const standardCourses = courses.filter(c => !c.is_inner_circle);
  const innerCircleCourses = courses.filter(c => c.is_inner_circle);
  const myCourses = standardCourses.filter((c) => enrolledCourseIds.includes(c.id));
  const availableCourses = standardCourses.filter((c) => !enrolledCourseIds.includes(c.id));
  const featuredCourses = standardCourses.filter((c) => c.is_featured);
  const sliderCourses = featuredCourses.length > 0 ? featuredCourses : standardCourses;

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
  const navBtn = (active) => `px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#1D2120] text-[#D4F658]" : "text-[#6B6B6B] hover:bg-[#1D2120]/5"}`;

  return (
    <div className="min-h-screen bg-[#F5F5F3]" style={{ fontFamily: FONT_BODY }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#F5F5F3]/80 backdrop-blur-xl border-b border-[#1D2120]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#1D2120]" style={{ fontFamily: FONT_HEADING }}>The Movement</span>
            <span className="text-[10px] text-[#1D2120] bg-[#D4F658] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">LMS</span>
          </button>
          <nav className="flex items-center gap-2">
            <button onClick={goHome} className={navBtn(view === "home" || view === "course")}>My Courses</button>
            <button onClick={() => { setView("forum"); setSelectedCourse(null); window.scrollTo(0, 0); }} className={navBtn(view === "forum")}>Forum</button>
            {hasInnerCircle && (
              <button onClick={() => { setView("inner-circle"); setSelectedCourse(null); window.scrollTo(0, 0); }} className={navBtn(view === "inner-circle")}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4F658]"></span>
                  Inner Circle
                </span>
              </button>
            )}
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
          <HomeContent myCourses={myCourses} availableCourses={availableCourses} onSelectCourse={openCourse} userName={firstName} />
        </>
      )}
      {view === "course" && selectedCourse && (
        <CourseDetail course={selectedCourse} isEnrolled={enrolledCourseIds.includes(selectedCourse.id)} onBack={goHome} />
      )}
      {view === "forum" && <Forum user={user} courses={courses} />}
      {view === "inner-circle" && hasInnerCircle && (
        <InnerCircle user={user} courses={innerCircleCourses} enrolledCourseIds={enrolledCourseIds} onSelectCourse={openCourse} />
      )}
    </div>
  );
}

function HomeContent({ myCourses, availableCourses, onSelectCourse, userName }) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
      <section className="mb-20">
        <div className="mb-8">
          <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">Your Content</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: FONT_HEADING }}>
            Hello, {userName} 👋
          </h2>
          <p className="text-[#6B6B6B] text-lg mt-2">Continue where you left off</p>
        </div>
        {myCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <CourseCard key={course.id} course={course} enrolled onClick={() => onSelectCourse(course)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#1D2120]/5">
            <p className="text-[#6B6B6B] text-lg">No active courses yet. Browse the catalog below.</p>
          </div>
        )}
      </section>

      {availableCourses.length > 0 && (
        <section>
          <div className="mb-8">
            <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">Full Catalog</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: FONT_HEADING }}>
              Available Courses
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