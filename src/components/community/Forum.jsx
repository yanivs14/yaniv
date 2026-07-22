import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Plus, ArrowLeft, Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import UserRanking from "@/components/community/UserRanking";

const FONT_HEADING = "'Frank Ruhl Libre', 'Times New Roman', serif";

function getRankBadge(activity) {
  if (!activity) return null;
  const count = activity.total || 0;
  if (count >= 30) return { label: "Top Contributor", className: "bg-[#D4F658] text-[#1D2120]" };
  if (count >= 15) return { label: "Regular", className: "bg-[#1D2120]/10 text-[#1D2120]" };
  if (count >= 5) return { label: "Active", className: "bg-[#1D2120]/5 text-[#6B6B6B]" };
  return null;
}

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
  const [newTopicImageUrl, setNewTopicImageUrl] = useState(null);
  const [newTopicImagePreview, setNewTopicImagePreview] = useState(null);
  const [newReplyImageUrl, setNewReplyImageUrl] = useState(null);
  const [newReplyImagePreview, setNewReplyImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [authorActivity, setAuthorActivity] = useState({});

  const topicFileRef = useRef(null);
  const replyFileRef = useRef(null);

  const loadRankings = async () => {
    try {
      const allTopics = await base44.entities.ForumTopic.list("-created_date", 200);
      const allReplies = await base44.entities.ForumReply.list("-created_date", 200);
      const activity = {};
      allTopics.forEach(t => {
        if (t.author_name) {
          if (!activity[t.author_name]) activity[t.author_name] = { name: t.author_name, id: t.author_id, topics: 0, replies: 0 };
          activity[t.author_name].topics++;
        }
      });
      allReplies.forEach(r => {
        if (r.author_name) {
          if (!activity[r.author_name]) activity[r.author_name] = { name: r.author_name, id: r.author_id, topics: 0, replies: 0 };
          activity[r.author_name].replies++;
        }
      });
      const ranked = Object.values(activity)
        .map(a => ({ ...a, total: a.topics + a.replies }))
        .sort((a, b) => b.total - a.total);
      setRankings(ranked);
      setAuthorActivity(activity);
    } catch {}
  };

  const loadTopics = async () => {
    try {
      const t = await base44.entities.ForumTopic.list("-created_date", 50);
      setTopics(t);
      await loadRankings();
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

  const handleImageUpload = async (file, setUrl, setPreview) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUrl(file_url);
      setPreview(URL.createObjectURL(file));
    } catch {}
    setUploading(false);
  };

  const clearTopicImage = () => {
    setNewTopicImageUrl(null);
    setNewTopicImagePreview(null);
    if (topicFileRef.current) topicFileRef.current.value = "";
  };

  const clearReplyImage = () => {
    setNewReplyImageUrl(null);
    setNewReplyImagePreview(null);
    if (replyFileRef.current) replyFileRef.current.value = "";
  };

  const createTopic = async () => {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const topic = await base44.entities.ForumTopic.create({
        title: newTitle,
        content: newContent,
        author_name: user?.full_name || "Student",
        author_id: user?.id,
        image_url: newTopicImageUrl,
      });
      setTopics([topic, ...topics]);
      setNewTitle("");
      setNewContent("");
      clearTopicImage();
      setShowNewTopic(false);
      await loadRankings();
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
        image_url: newReplyImageUrl,
      });
      setReplies([...replies, reply]);
      setNewReply("");
      clearReplyImage();
      setSelectedTopic({ ...selectedTopic, reply_count: (selectedTopic.reply_count || 0) + 1 });
      await loadRankings();
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

  // --- Topic Detail View ---
  if (selectedTopic) {
    const topicBadge = getRankBadge(authorActivity[selectedTopic.author_name]);
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Forum</span>
        </button>

        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-[#1D2120]/5">
          <h1 className="text-3xl font-bold text-[#1D2120] mb-4" dir="auto">{selectedTopic.title}</h1>
          {selectedTopic.content && <p className="text-[#6B6B6B] leading-relaxed whitespace-pre-wrap text-lg" dir="auto">{selectedTopic.content}</p>}
          {selectedTopic.image_url && (
            <img src={selectedTopic.image_url} alt="" className="mt-6 rounded-2xl max-h-96 w-full object-cover" />
          )}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#1D2120]/5">
            <div className="w-10 h-10 rounded-xl bg-[#D4F658] flex items-center justify-center">
              <span className="text-sm font-bold text-[#1D2120]">{selectedTopic.author_name?.[0] || "S"}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#1D2120]">{selectedTopic.author_name}</p>
                {topicBadge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${topicBadge.className}`}>{topicBadge.label}</span>
                )}
              </div>
              <p className="text-xs text-[#6B6B6B]">{formatDate(selectedTopic.created_date)}</p>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-[#1D2120] text-lg mb-5" style={{ fontFamily: FONT_HEADING }}>Replies ({replies.length})</h3>
        <div className="space-y-4 mb-8">
          {replies.map((reply) => {
            const replyBadge = getRankBadge(authorActivity[reply.author_name]);
            return (
              <div key={reply.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#1D2120]/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D4F658] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#1D2120]">{reply.author_name?.[0] || "S"}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#1D2120]">{reply.author_name}</p>
                      {replyBadge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${replyBadge.className}`}>{replyBadge.label}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6B6B]">{formatDate(reply.created_date)}</p>
                  </div>
                </div>
                <p className="text-[#6B6B6B] text-sm leading-relaxed whitespace-pre-wrap" dir="auto">{reply.content}</p>
                {reply.image_url && (
                  <img src={reply.image_url} alt="" className="mt-3 rounded-xl max-h-80 w-full object-cover" />
                )}
              </div>
            );
          })}
        </div>

        {/* Reply form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1D2120]/5">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            dir="auto"
            className="w-full resize-none border border-[#1D2120]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3]"
          />
          {newReplyImagePreview && (
            <div className="relative inline-block mt-3">
              <img src={newReplyImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />
              <button onClick={clearReplyImage} className="absolute -top-2 -right-2 w-6 h-6 bg-[#1D2120] text-white rounded-full flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <input
              ref={replyFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], setNewReplyImageUrl, setNewReplyImagePreview)}
            />
            <button
              type="button"
              onClick={() => replyFileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] text-sm font-medium transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>{uploading ? "Uploading..." : "Attach image"}</span>
            </button>
            <button
              onClick={createReply}
              disabled={!newReply.trim() || submitting}
              className="flex items-center gap-2 bg-[#1D2120] text-[#D4F658] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a302e] disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send Reply</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Topic List View ---
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
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
          {newTopicImagePreview && (
            <div className="relative inline-block mb-4">
              <img src={newTopicImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl" />
              <button onClick={clearTopicImage} className="absolute -top-2 -right-2 w-6 h-6 bg-[#1D2120] text-white rounded-full flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <input
              ref={topicFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], setNewTopicImageUrl, setNewTopicImagePreview)}
            />
            <button
              type="button"
              onClick={() => topicFileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] text-sm font-medium transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>{uploading ? "Uploading..." : "Attach image"}</span>
            </button>
            <div className="flex gap-2">
              <button onClick={createTopic} disabled={!newTitle.trim() || submitting} className="bg-[#1D2120] text-[#D4F658] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2a302e] disabled:opacity-40 transition-colors">Post</button>
              <button onClick={() => { setShowNewTopic(false); setNewTitle(""); setNewContent(""); clearTopicImage(); }} className="text-[#6B6B6B] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D2120]/5 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Topics */}
        <div className="lg:col-span-2">
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
              {topics.map((topic) => {
                const topicBadge = getRankBadge(authorActivity[topic.author_name]);
                return (
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
                        <h3 className="font-bold text-[#1D2120] text-lg" dir="auto">{topic.title}</h3>
                        {topic.content && <p className="text-[#6B6B6B] text-sm mt-1 line-clamp-2" dir="auto">{topic.content}</p>}
                        {topic.image_url && (
                          <img src={topic.image_url} alt="" className="mt-3 w-24 h-24 object-cover rounded-xl" />
                        )}
                        <div className="flex items-center gap-2 mt-3 text-xs text-[#6B6B6B]">
                          <span className="font-medium">{topic.author_name}</span>
                          {topicBadge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${topicBadge.className}`}>{topicBadge.label}</span>
                          )}
                          <span>•</span>
                          <span>{formatDate(topic.created_date)}</span>
                          <span>•</span>
                          <span>{topic.reply_count || 0} replies</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ranking sidebar */}
        <div>
          <UserRanking rankings={rankings} currentUserName={user?.full_name} />
        </div>
      </div>
    </div>
  );
}