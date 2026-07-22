import React from "react";
import CourseCard from "@/components/community/CourseCard";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

export default function InnerCircle({ user, courses, enrolledCourseIds, onSelectCourse }) {
  return (
    <div>
      {/* Dark hero */}
      <div className="bg-[#1D2120] text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D4F658] animate-pulse"></span>
            <span className="text-xs text-[#D4F658] font-bold uppercase tracking-widest">Exclusive Access</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold" style={{ fontFamily: FONT_HEADING }}>Inner Circle</h1>
          <p className="text-white/60 text-lg mt-4 max-w-xl">Premium courses, personalized coaching, and an exclusive community of dedicated practitioners.</p>
        </div>
      </div>

      {/* Courses */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-8">
          <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">Members Only</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: FONT_HEADING }}>Exclusive Courses</h2>
        </div>
        {courses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} enrolled={enrolledCourseIds.includes(course.id)} onClick={() => onSelectCourse(course)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#1D2120]/5">
            <p className="text-[#6B6B6B] text-lg">Exclusive courses coming soon. Stay tuned.</p>
          </div>
        )}
      </div>
    </div>
  );
}