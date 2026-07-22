import React from "react";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

export default function CourseCard({ course, enrolled, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="aspect-[16/10] bg-[#1D2120] relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#D4F658]/30 text-5xl">📹</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D2120]/60 to-transparent" />
        {enrolled && (
          <span className="absolute top-4 right-4 bg-[#D4F658] text-[#1D2120] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Active</span>
        )}
      </div>
      <div className="p-6">
        {course.category && (
          <span className="text-xs text-[#1D2120] font-bold uppercase tracking-widest">{course.category}</span>
        )}
        <h3 className="text-xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: FONT_HEADING }}>{course.title}</h3>
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