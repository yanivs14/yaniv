import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const LABEL_OPTIONS = [
  { text: "Design", color: "purple" },
  { text: "Marketing", color: "blue" },
  { text: "Bug", color: "red" },
  { text: "Feature", color: "green" },
  { text: "Urgent", color: "red" },
  { text: "Research", color: "yellow" },
  { text: "Content", color: "teal" },
];

const LABEL_COLORS = {
  green: "bg-green-500", yellow: "bg-yellow-500", red: "bg-red-500",
  blue: "bg-blue-500", purple: "bg-purple-500", teal: "bg-teal-500",
};

export default function TaskModal({ task, defaultStatus, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [labels, setLabels] = useState([]);
  const [labelInput, setLabelInput] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "todo");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date || "");
      setAssignedTo(task.assigned_to || "");
      setLabels(task.labels || []);
    } else {
      setStatus(defaultStatus || "todo");
    }
  }, [task, defaultStatus]);

  const toggleLabel = (labelStr) => {
    setLabels(prev =>
      prev.includes(labelStr) ? prev.filter(l => l !== labelStr) : [...prev, labelStr]
    );
  };

  const addCustomLabel = () => {
    if (!labelInput.trim()) return;
    setLabels(prev => [...prev, `${labelInput.trim()}:blue`]);
    setLabelInput("");
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(task?.id ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: dueDate || null,
      assigned_to: assignedTo.trim(),
      labels,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-body text-lg font-bold text-slate-900">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <div className="flex items-center gap-2">
            {task && (
              <button
                onClick={() => { onDelete(task); onClose(); }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.metaKey && handleSave()}
              placeholder="Task title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due date + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Assigned To</label>
              <input
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder="Name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-body font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {LABEL_OPTIONS.map(opt => {
                const labelStr = `${opt.text}:${opt.color}`;
                const active = labels.includes(labelStr);
                return (
                  <button
                    key={labelStr}
                    onClick={() => toggleLabel(labelStr)}
                    className={`text-[10px] font-body font-medium px-2 py-1 rounded transition-all ${
                      active
                        ? `${LABEL_COLORS[opt.color]} text-white`
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
            {/* Active custom labels */}
            {labels.filter(l => !LABEL_OPTIONS.some(o => `${o.text}:${o.color}` === l)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {labels.filter(l => !LABEL_OPTIONS.some(o => `${o.text}:${o.color}` === l)).map((l, i) => {
                  const [text, color] = l.split(":");
                  return (
                    <button
                      key={i}
                      onClick={() => toggleLabel(l)}
                      className={`text-[10px] font-body font-medium px-2 py-1 rounded text-white ${LABEL_COLORS[color] || "bg-slate-400"}`}
                    >
                      {text} ✕
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomLabel())}
                placeholder="Custom label..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-body text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={addCustomLabel}
                className="text-xs font-body text-teal-600 hover:text-teal-700 px-2"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-body text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2 bg-teal-600 text-white text-sm font-body font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}