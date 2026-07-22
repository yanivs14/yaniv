import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Plus, ArrowRight, Send } from "lucide-react";

export default function Forum({ user }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTopics = async () => {
    try {
      const t = await base44.entities.ForumTopic.list("-created_date", 50);
      setTopics(t);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadTopics(); }, []);

  useEffect(() => {
    if (selectedTopic) {
      base44.entities.ForumReply.filter({ topic_id: selectedTopic.id })
        .then(setReplies)
        .catch(() => {});
    }
  }, [selectedTopic]);

  const createTopic = async () => {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const topic = await base44.entities.ForumTopic.create({
        title: newTitle,
        content: newContent,
        author_name: user?.full_name || "תלמיד",
        author_id: user?.id,
      });
      setTopics([topic, ...topics]);
      setNewTitle("");
      setNewContent("");
      setShowNewTopic(false);
    } catch {}
    setSubmitting(false);
  };

  const createReply = async () => {
    if (!newReply.trim()) return;
    setSubmitting(true);
    try {
      const reply = await base44.entities.ForumReply.create({
        topic_id: selectedTopic.id,
        content: newReply,
        author_name: user?.full_name || "תלמיד",
        author_id: user?.id,
      });
      setReplies([...replies, reply]);
      setNewReply("");
      setSelectedTopic({ ...selectedTopic, reply_count: (selectedTopic.reply_count || 0) + 1 });
    } catch {}
    setSubmitting(false);
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "עכשיו";
    if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דקות`;
    if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
    return `לפני ${Math.floor(diff / 86400)} ימים`;
  };

  if (selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-6">
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">חזרה לפורום</span>
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedTopic.title}</h1>
          {selectedTopic.content && <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedTopic.content}</p>}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">{selectedTopic.author_name?.[0] || "ת"}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedTopic.author_name}</p>
              <p className="text-xs text-gray-400">{formatDate(selectedTopic.created_date)}</p>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-4">תגובות ({replies.length})</h3>
        <div className="space-y-3 mb-6">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-teal-700">{reply.author_name?.[0] || "ת"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{reply.author_name}</p>
                  <p className="text-xs text-gray-400">{formatDate(reply.created_date)}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="כתוב תגובה..."
            rows={3}
            className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
          <button
            onClick={createReply}
            disabled={!newReply.trim() || submitting}
            className="mt-2 flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>שלח תגובה</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">פורום תלמידים</h1>
          <p className="text-gray-500 mt-1">שאלו שאלות, שתפו התקדמות ועזרו לתלמידים אחרים</p>
        </div>
        <button
          onClick={() => setShowNewTopic(!showNewTopic)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>נושא חדש</span>
        </button>
      </div>

      {showNewTopic && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="כותרת הנושא"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-teal-400 mb-2"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="תוכן ההודעה..."
            rows={4}
            className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 mb-3"
          />
          <div className="flex gap-2">
            <button onClick={createTopic} disabled={!newTitle.trim() || submitting} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors">פרסם</button>
            <button onClick={() => { setShowNewTopic(false); setNewTitle(""); setNewContent(""); }} className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">ביטול</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">אין עדיין נושאים בפורום. פתחו את הנושא הראשון!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="w-full text-right bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-teal-700">{topic.author_name?.[0] || "ת"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{topic.title}</h3>
                  {topic.content && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{topic.content}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{topic.author_name}</span>
                    <span>•</span>
                    <span>{formatDate(topic.created_date)}</span>
                    <span>•</span>
                    <span>{topic.reply_count || 0} תגובות</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}