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
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (!courses || courses.length === 0) return null;

  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">גלה את הקורסים</h2>
        <p className="text-gray-500 mt-1">הצצה לתוכן שמחכה לך בפנים</p>
      </div>
      <div className="relative" dir="ltr">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 border border-gray-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 no-scrollbar"
        >
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="flex-shrink-0 w-[220px] sm:w-[260px] aspect-[9/16] rounded-2xl overflow-hidden snap-center group relative shadow-md"
            >
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-teal-700 ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                {course.category && (
                  <span className="text-[10px] text-teal-300 font-bold uppercase tracking-widest">{course.category}</span>
                )}
                <h3 className="text-white font-bold text-lg leading-tight mt-1 line-clamp-2">{course.title}</h3>
                {course.instructor && (
                  <p className="text-white/60 text-xs mt-1">{course.instructor}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}