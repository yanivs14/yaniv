import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export default function VideoSlider({ courses, onSelectCourse }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [courses]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-10">
        <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">חקר וגילוי</span>
        <h2 className="text-4xl lg:text-6xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: "'Times New Roman', serif" }}>
          גלה את הקורסים
        </h2>
        <p className="text-[#6B6B6B] text-lg mt-3 max-w-lg">הצצה לתוכן שמחכה לך בפנים — גלילה אופקית לחוויית גילוי מלאה</p>
      </div>
      <div className="relative" dir="ltr">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#D4F658] transition-colors border border-[#1D2120]/5"
          >
            <ChevronLeft className="w-5 h-5 text-[#1D2120]" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#D4F658] transition-colors border border-[#1D2120]/5"
          >
            <ChevronRight className="w-5 h-5 text-[#1D2120]" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-6 lg:px-10 pb-4 no-scrollbar"
        >
          {courses.map((course, i) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="flex-shrink-0 w-[260px] sm:w-[300px] aspect-[9/16] rounded-3xl overflow-hidden snap-center group relative shadow-2xl hover:shadow-3xl transition-shadow duration-500"
            >
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1D2120] to-[#2a302e]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1D2120] via-[#1D2120]/20 to-transparent" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-[#D4F658] flex items-center justify-center shadow-2xl">
                  <Play className="w-7 h-7 text-[#1D2120] ml-1" fill="currentColor" />
                </div>
              </div>
              {/* Number badge */}
              <div className="absolute top-5 left-5 w-9 h-9 rounded-full bg-[#D4F658] flex items-center justify-center">
                <span className="text-xs font-bold text-[#1D2120]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                {course.category && (
                  <span className="text-[10px] text-[#D4F658] font-bold uppercase tracking-widest">{course.category}</span>
                )}
                <h3 className="text-white text-2xl font-bold leading-tight mt-2" style={{ fontFamily: "'Times New Roman', serif" }}>{course.title}</h3>
                {course.instructor && (
                  <p className="text-white/50 text-sm mt-2">{course.instructor}</p>
                )}
                {course.duration_label && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-white/40 text-xs">
                    <span>{course.duration_label}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}