import React, { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";

const COLOR_MAP = {
  slate: { dot: "bg-slate-400", header: "bg-slate-50" },
  blue: { dot: "bg-blue-500", header: "bg-blue-50" },
  amber: { dot: "bg-amber-500", header: "bg-amber-50" },
  purple: { dot: "bg-purple-500", header: "bg-purple-50" },
  teal: { dot: "bg-teal-500", header: "bg-teal-50" },
  green: { dot: "bg-green-500", header: "bg-green-50" },
  red: { dot: "bg-red-500", header: "bg-red-50" },
  pink: { dot: "bg-pink-500", header: "bg-pink-50" },
};

export default function TaskColumn({ columnId, title, color, tasks, onCardClick, onCardDelete, onAddCard, onRename, onDelete, canDelete }) {
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const config = COLOR_MAP[color] || COLOR_MAP.slate;

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== title) {
      onRename(titleInput.trim());
    } else {
      setTitleInput(title);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-slate-100/70 rounded-xl border border-slate-200 max-h-full">
      {/* Column header */}
      <div className={`flex items-center justify-between gap-1 px-3 py-2.5 rounded-t-xl ${config.header}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dot} flex-shrink-0`} />
          {editing ? (
            <input
              autoFocus
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") { setTitleInput(title); setEditing(false); }
              }}
              onBlur={handleSaveTitle}
              className="flex-1 min-w-0 bg-white border border-teal-400 rounded px-2 py-0.5 text-xs font-body font-bold text-slate-700 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => { setTitleInput(title); setEditing(true); }}
              className="text-xs font-body font-bold text-slate-700 uppercase tracking-wide hover:text-teal-600 transition-colors truncate cursor-text"
              title="Click to rename"
            >
              {title}
            </button>
          )}
          <span className="text-[10px] font-body font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded-full flex-shrink-0">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => onAddCard(columnId)}
            className="text-slate-400 hover:text-teal-600 transition-colors p-0.5"
          >
            <Plus className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 overflow-y-auto transition-colors min-h-[100px] ${
              snapshot.isDraggingOver ? "bg-teal-50/50" : ""
            }`}
            style={{ maxHeight: "calc(100vh - 240px)" }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onCardClick}
                onDelete={onCardDelete}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <button
                onClick={() => onAddCard(columnId)}
                className="w-full text-xs text-slate-400 hover:text-teal-600 py-4 border border-dashed border-slate-300 rounded-lg transition-colors"
              >
                + Add card
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}