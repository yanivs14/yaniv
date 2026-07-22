import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Lock, Play } from "lucide-react";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function CourseDetail({ course, isEnrolled, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const l = await base44.entities.Lesson.filter({ course_id: course.id }, "order", 200);
        setLessons(l);
        if (l.length > 0) setSelectedLesson(l[0]);
      } catch {}
      setLoading(false);
    })();
  }, [course.id]);

  const ytId = getYouTubeId(selectedLesson?.video_url);

  return (
    <div>
      {/* Hero header */}
      <div className="bg-[#1D2120] text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-[#D4F658] transition-colors mb-8">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm font-medium">חזרה לקורסים</span>
          </button>
          <div className="max-w-3xl">
            {course.category && (
              <span className="text-xs text-[#D4F658] font-bold uppercase tracking-widest">{course.category}</span>
            )}
            <h1 className="text-4xl lg:text-5xl font-bold mt-3" style={{ fontFamily: "'Times New Roman', serif" }}>{course.title}</h1>
            {course.short_description && <p className="text-white/60 text-lg mt-4 leading-relaxed">{course.short_description}</p>}
            <div className="flex items-center gap-4 mt-5 text-sm text-white/40">
              {course.instructor && <span>מרצה: {course.instructor}</span>}
              {course.instructor && course.duration_label && <span>•</span>}
              {course.duration_label && <span>{course.duration_label}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video player */}
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-[#D4F658] rounded-full animate-spin" />
                </div>
              ) : ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : selectedLesson?.video_url ? (
                <video src={selectedLesson.video_url} controls className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <Play className="w-20 h-20" />
                </div>
              )}
            </div>
            {selectedLesson && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-[#1D2120]" style={{ fontFamily: "'Times New Roman', serif" }}>{selectedLesson.title}</h2>
                {selectedLesson.description && (
                  <p className="text-[#6B6B6B] mt-3 leading-relaxed text-lg">{selectedLesson.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Lessons list */}
          <div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#1D2120]/5">
              <div className="px-6 py-5 border-b border-[#1D2120]/5">
                <h3 className="font-bold text-[#1D2120] text-lg" style={{ fontFamily: "'Times New Roman', serif" }}>סילבוס הקורס</h3>
                <p className="text-xs text-[#6B6B6B] mt-1">{lessons.length} שיעורים</p>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-[#6B6B6B] text-sm">טוען שיעורים...</div>
                ) : lessons.length === 0 ? (
                  <div className="p-6 text-center text-[#6B6B6B] text-sm">אין שיעורים עדיין</div>
                ) : (
                  lessons.map((lesson, i) => {
                    const canAccess = isEnrolled || lesson.is_preview;
                    const isActive = selectedLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => canAccess && setSelectedLesson(lesson)}
                        disabled={!canAccess}
                        className={`w-full text-right p-4 border-b border-[#1D2120]/5 last:border-0 flex items-start gap-3 transition-all ${
                          isActive ? "bg-[#D4F658]/10" : canAccess ? "hover:bg-[#1D2120]/3" : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {canAccess ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive ? "bg-[#D4F658] text-[#1D2120]" : "bg-[#1D2120]/5 text-[#1D2120]"
                            }`}>
                              {i + 1}
                            </div>
                          ) : (
                            <Lock className="w-5 h-5 text-[#6B6B6B]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isActive ? "text-[#1D2120]" : "text-[#1D2120]"}`}>{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.duration && <span className="text-xs text-[#6B6B6B]">{lesson.duration}</span>}
                            {lesson.is_preview && (
                              <span className="text-xs text-[#1D2120] bg-[#D4F658] px-2 py-0.5 rounded-full font-medium">תצוגה מקדימה</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            {!isEnrolled && (
              <div className="mt-6 bg-[#1D2120] rounded-3xl p-6 text-center">
                <p className="text-white/70 text-sm mb-4">רכשו את הקורס כדי לפתוח את כל השיעורים</p>
                <a href="/handstand-course" className="inline-block bg-[#D4F658] text-[#1D2120] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#c4e64a] transition-colors">
                  רכשו עכשיו
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}