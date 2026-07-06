import React, { useState } from "react";
import { StickyNote, Save, Check, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MeetingNotes({ event_uuid, invitee_email, invitee_name, event_name, start_time, existingNote, onSaved, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState(existingNote || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke("manageMeetingNote", {
        action: "save",
        event_uuid,
        invitee_email,
        invitee_name,
        event_name,
        start_time,
        notes: noteText,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved(event_uuid, noteText);
    } catch (e) {
      console.error("Failed to save note:", e);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke("manageMeetingNote", {
        action: "delete",
        event_uuid,
      });
      setNoteText("");
      setExpanded(false);
      if (onDeleted) onDeleted(event_uuid);
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
    setDeleting(false);
  };

  return (
    <div className="mt-2 border-t border-slate-100 pt-2">
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded) setNoteText(existingNote || "");
        }}
        className="flex items-center gap-1.5 text-[11px] font-body text-slate-500 hover:text-teal-600 transition-colors"
      >
        <StickyNote className="w-3.5 h-3.5" />
        {existingNote ? "Edit note" : "Add note"}
        {existingNote && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
      </button>
      {expanded && (
        <div className="mt-2">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            dir="auto"
            placeholder="כתוב הערה כאן... (עברית / English)"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-body placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-y min-h-[80px] leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1.5">
            {existingNote ? (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-[11px] font-body text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            ) : <span />}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-[11px] font-body text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}