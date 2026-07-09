import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Trash2, User } from "lucide-react";

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  high: { label: "High", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  medium: { label: "Medium", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  low: { label: "Low", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

const LABEL_COLORS = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
};

export default function TaskCard({ task, index, onClick, onDelete }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date(new Date().toDateString());

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`group bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer hover:border-teal-300 hover:shadow-md transition-all ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-teal-400 rotate-1" : ""
          }`}
        >
          {/* Priority bar */}
          <div className={`flex items-center gap-1.5 mb-2`}>
            <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
            <span className={`text-[10px] font-body font-semibold uppercase tracking-wide ${priority.text}`}>
              {priority.label}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-body font-medium text-slate-800 mb-1.5 leading-snug">{task.title}</p>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label, i) => {
                const [text, color] = label.split(":");
                return (
                  <span
                    key={i}
                    className={`text-[9px] font-body font-medium px-1.5 py-0.5 rounded text-white ${LABEL_COLORS[color] || "bg-slate-400"}`}
                  >
                    {text}
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              {dueDate && (
                <span className={`flex items-center gap-0.5 ${isOverdue ? "text-red-500 font-semibold" : ""}`}>
                  <Calendar className="w-3 h-3" />
                  {dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </span>
              )}
              {task.assigned_to && (
                <span className="flex items-center gap-0.5">
                  <User className="w-3 h-3" />
                  {task.assigned_to.split(" ")[0]}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}