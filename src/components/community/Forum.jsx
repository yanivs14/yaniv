import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Plus, ArrowLeft, Send } from "lucide-react";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

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
        author_name: user?.full_name || "Student",
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
        author_name: user?.full_name || "Student",
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
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Forum</span>
        </button>

        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-[#1D2120]/5">
          <h1 className="text-3xl font-bold text-[#1D2120] mb-4" style={{ fontFamily: FONT_HEADING }} dir="auto">{selectedTopic.title}</h1>
          {selectedTopic.content && <p className="text-[#6B6B6B] leading-relaxed whitespace-pre-wrap text-lg" dir="auto">{selectedTopic.content}</p>}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#1D2120]/5">
            <div className="w-10 h-10 rounded-xl bg-[#D4F658] flex items-center justify-center">
              <span className="text-sm font-bold text-[#1D2120]">{selectedTopic.author_name?.[0] || "S"}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1D2120]">{selectedTopic.author_name}</p>
              <p className="text-xs text-[#6B6B6B]">{formatDate(selectedTopic.created_date)}</p>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-[#1D2120] text-lg mb-5" style={{ fontFamily: FONT_HEADING }}>Replies ({replies.length})</h3>
        <div className="space-y-4 mb-8">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#1D2120]/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4F658] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#1D2120]">{reply.author_name?.[0] || "S"}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1D2120]">{reply.author_name}</p>
                  <p className="text-xs text-[#6B6B6B]">{formatDate(reply.created_date)}</p>
                </div>
              </div>
              <p className="text-[#6B6B6B] text-sm leading-relaxed whitespace-pre-wrap" dir="auto">{reply.content}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1D2120]/5">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            dir="auto"
            className="w-full resize-none border border-[#1D2120]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3]"
          />
          <button
            onClick={createReply}
            disabled={!newReply.trim() || submitting}
            className="mt-3 flex items-center gap-2 bg-[#1D2120] text-[#D4F658] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a302e] disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send Reply</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-xs text-[#6B6B6B] uppercase tracking-widest font-medium">Community</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#1D2120] mt-2" style={{ fontFamily: FONT_HEADING }}>Student Forum</h1>
          <p className="text-[#6B6B6B] text-lg mt-3">Ask questions, share progress, and help fellow students</p>
        </div>
        <button
          onClick={() => setShowNewTopic(!showNewTopic)}
          className="flex items-center gap-2 bg-[#D4F658] text-[#1D2120] px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#c4e64a] transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Topic</span>
        </button>
      </div>

      {showNewTopic && (
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-[#1D2120]/5">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Topic title"
            dir="auto"
            className="w-full border border-[#1D2120]/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3] mb-3"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Topic content..."
            rows={4}
            dir="auto"
            className="w-full resize-none border border-[#1D2120]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3] mb-4"
          />
          <div className="flex gap-2">
            <button onClick={createTopic} disabled={!newTitle.trim() || submitting} className="bg-[#1D2120] text-[#D4F658] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a302e] disabled:opacity-40 transition-colors">Post</button>
            <button onClick={() => { setShowNewTopic(false); setNewTitle(""); setNewContent(""); }} className="text-[#6B6B6B] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D2120]/5 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-[#1D2120]/10 border-t-[#D4F658] rounded-full animate-spin mx-auto" />
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-[#1D2120]/5">
          <MessageCircle className="w-14 h-14 text-[#1D2120]/10 mx-auto mb-4" />
          <p className="text-[#6B6B6B] text-lg">No topics yet. Start the first discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-[#1D2120]/5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#D4F658] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#1D2120]">{topic.author_name?.[0] || "S"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1D2120] text-lg" style={{ fontFamily: FONT_HEADING }} dir="auto">{topic.title}</h3>
                  {topic.content && <p className="text-[#6B6B6B] text-sm mt-1 line-clamp-2" dir="auto">{topic.content}</p>}
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#6B6B6B]">
                    <span className="font-medium">{topic.author_name}</span>
                    <span>•</span>
                    <span>{formatDate(topic.created_date)}</span>
                    <span>•</span>
                    <span>{topic.reply_count || 0} replies</span>
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