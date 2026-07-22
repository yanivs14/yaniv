import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Pin, Search, ArrowLeft, Save, Pencil } from "lucide-react";
import { LoadingSpinner, PageHeader } from "@/components/community/admin/AdminShared";

export default function AdminForum() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const load = async () => {
    try { setTopics(await base44.entities.ForumTopic.list("-created_date", 200)); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selectedTopic) {
      base44.entities.ForumReply.filter({ topic_id: selectedTopic.id }).then(setReplies).catch(() => {});
    }
  }, [selectedTopic]);

  const handleDeleteTopic = async (id) => {
    if (!confirm("Delete this topic and all its replies?")) return;
    await base44.entities.ForumTopic.delete(id);
    if (selectedTopic?.id === id) setSelectedTopic(null);
    load();
  };

  const handleDeleteReply = async (id) => {
    if (!confirm("Delete this reply?")) return;
    await base44.entities.ForumReply.delete(id);
    if (selectedTopic) {
      base44.entities.ForumReply.filter({ topic_id: selectedTopic.id }).then(setReplies);
    }
  };

  const togglePin = async (topic) => {
    await base44.entities.ForumTopic.update(topic.id, { is_pinned: !topic.is_pinned });
    load();
  };

  const startEdit = (item) => { setEditingId(item.id); setEditContent(item.content || ""); };
  const saveEdit = async (type, id) => {
    const entity = type === "topic" ? "ForumTopic" : "ForumReply";
    await base44.entities[entity].update(id, { content: editContent });
    setEditingId(null); setEditContent("");
    if (type === "topic") load();
    else if (selectedTopic) base44.entities.ForumReply.filter({ topic_id: selectedTopic.id }).then(setReplies);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  const filtered = topics.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.author_name || "").toLowerCase().includes(search.toLowerCase()));

  if (selectedTopic) {
    return (
      <div>
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1D2120] mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Topics
        </button>
        <div className="bg-white rounded-2xl p-6 border border-[#1D2120]/5 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-bold text-[#1D2120]">{selectedTopic.title}</h1>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => togglePin(selectedTopic)} className={`flex items-center justify-center w-8 h-8 rounded-lg ${selectedTopic.is_pinned ? "bg-[#D4F658] text-[#1D2120]" : "bg-[#1D2120]/5 text-[#6B6B6B]"}`}>
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDeleteTopic(selectedTopic.id)} className="flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {editingId === selectedTopic.id ? (
            <div>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full border border-[#1D2120]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3] mb-2" />
              <button onClick={() => saveEdit("topic", selectedTopic.id)} className="flex items-center gap-2 bg-[#1D2120] text-[#D4F658] px-4 py-2 rounded-lg text-xs font-bold">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <p className="text-[#6B6B6B] text-sm whitespace-pre-wrap">{selectedTopic.content || "No content"}</p>
              <button onClick={() => startEdit(selectedTopic)} className="flex items-center justify-center w-8 h-8 bg-[#1D2120]/5 text-[#1D2120] rounded-lg hover:bg-[#1D2120]/10 flex-shrink-0">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs text-[#6B6B6B] mt-3">{selectedTopic.author_name} • {formatDate(selectedTopic.created_date)}</p>
        </div>
        <h3 className="font-bold text-[#1D2120] mb-4">Replies ({replies.length})</h3>
        <div className="space-y-3">
          {replies.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#1D2120]/5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-[#1D2120]">{r.author_name}</p>
                  <p className="text-xs text-[#6B6B6B]">{formatDate(r.created_date)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {editingId !== r.id && (
                    <button onClick={() => startEdit(r)} className="flex items-center justify-center w-8 h-8 bg-[#1D2120]/5 text-[#1D2120] rounded-lg hover:bg-[#1D2120]/10">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleDeleteReply(r.id)} className="flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {editingId === r.id ? (
                <div>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} className="w-full border border-[#1D2120]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4F658] bg-[#F5F5F3] mb-2" />
                  <button onClick={() => saveEdit("reply", r.id)} className="flex items-center gap-2 bg-[#1D2120] text-[#D4F658] px-4 py-2 rounded-lg text-xs font-bold">
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              ) : (
                <p className="text-[#6B6B6B] text-sm whitespace-pre-wrap">{r.content}</p>
              )}
            </div>
          ))}
          {replies.length === 0 && <p className="text-[#6B6B6B] text-sm text-center py-8">No replies yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Forum Moderation" subtitle="Manage topics and replies" />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics..." className="w-full pl-10 pr-4 py-2.5 border border-[#1D2120]/10 rounded-xl text-sm focus:outline-none focus:border-[#D4F658] bg-white" />
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#1D2120]/5">
              <p className="text-[#6B6B6B]">No topics found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => (
                <div key={t.id} className="bg-white rounded-2xl p-4 border border-[#1D2120]/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4F658] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#1D2120]">{t.author_name?.[0] || "S"}</span>
                  </div>
                  <button onClick={() => setSelectedTopic(t)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      {t.is_pinned && <Pin className="w-3 h-3 text-[#1D2120] flex-shrink-0" />}
                      <h3 className="font-bold text-[#1D2120] truncate">{t.title}</h3>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">{t.author_name} • {formatDate(t.created_date)} • {t.reply_count || 0} replies</p>
                  </button>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => togglePin(t)} className={`flex items-center justify-center w-8 h-8 rounded-lg ${t.is_pinned ? "bg-[#D4F658] text-[#1D2120]" : "bg-[#1D2120]/5 text-[#6B6B6B]"}`}>
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteTopic(t.id)} className="flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}