import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

const COLUMN_CONFIG = {
  backlog: { label: "Backlog", color: "bg-slate-400", headerBg: "bg-slate-50" },
  todo: { label: "To Do", color: "bg-blue-500", headerBg: "bg-blue-50" },
  in_progress: { label: "In Progress", color: "bg-amber-500", headerBg: "bg-amber-50" },
  review: { label: "Review", color: "bg-purple-500", headerBg: "bg-purple-50" },
  done: { label: "Done", color: "bg-teal-500", headerBg: "bg-teal-50" },
};

export default function TaskColumn({ columnKey, tasks, onCardClick, onCardDelete, onAddCard }) {
  const config = COLUMN_CONFIG[columnKey] || COLUMN_CONFIG.todo;

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-slate-100/70 rounded-xl border border-slate-200 max-h-full">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
          <span className="text-xs font-body font-bold text-slate-700 uppercase tracking-wide">{config.label}</span>
          <span className="text-[10px] font-body font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(columnKey)}
          className="text-slate-400 hover:text-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnKey}>
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
                onClick={() => onAddCard(columnKey)}
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