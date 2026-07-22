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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-6"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-sm font-medium">חזרה לקורסים</span>
      </button>

      <div className="mb-6">
        {course.category && (
          <span className="text-xs text-teal-600 font-medium uppercase tracking-wide">{course.category}</span>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mt-1">{course.title}</h1>
        {course.short_description && <p className="text-gray-600 mt-2">{course.short_description}</p>}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
          {course.instructor && <span>מרצה: {course.instructor}</span>}
          {course.instructor && course.duration_label && <span>•</span>}
          {course.duration_label && <span>{course.duration_label}</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-teal-500 rounded-full animate-spin" />
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
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <Play className="w-16 h-16" />
              </div>
            )}
          </div>
          {selectedLesson && (
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
              {selectedLesson.description && (
                <p className="text-gray-600 mt-2 leading-relaxed">{selectedLesson.description}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">סילבוס הקורס</h3>
              <p className="text-xs text-gray-400 mt-0.5">{lessons.length} שיעורים</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">טוען שיעורים...</div>
              ) : lessons.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">אין שיעורים עדיין</div>
              ) : (
                lessons.map((lesson, i) => {
                  const canAccess = isEnrolled || lesson.is_preview;
                  const isActive = selectedLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && setSelectedLesson(lesson)}
                      disabled={!canAccess}
                      className={`w-full text-right p-3 border-b border-gray-100 last:border-0 flex items-start gap-3 transition-colors ${
                        isActive ? "bg-teal-50" : canAccess ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {canAccess ? (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {i + 1}
                          </div>
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? "text-teal-700" : "text-gray-900"}`}>{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {lesson.duration && <span className="text-xs text-gray-400">{lesson.duration}</span>}
                          {lesson.is_preview && (
                            <span className="text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">תצוגה מקדימה</span>
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
            <div className="mt-4 bg-teal-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-3">רכשו את הקורס כדי לפתוח את כל השיעורים</p>
              <a href="/handstand-course" className="inline-block bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                רכשו עכשיו
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}