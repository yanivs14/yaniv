import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TaskColumn from "./tasks/TaskColumn";
import TaskModal from "./tasks/TaskModal";

const DEFAULT_COLUMNS = [
  { id: "backlog", title: "Backlog", color: "slate" },
  { id: "todo", title: "To Do", color: "blue" },
  { id: "in_progress", title: "In Progress", color: "amber" },
  { id: "review", title: "Review", color: "purple" },
  { id: "done", title: "Done", color: "teal" },
];

const COLOR_CYCLE = ["slate", "blue", "amber", "purple", "teal", "green", "red", "pink"];

export default function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const loadColumns = useCallback(async () => {
    try {
      const records = await base44.entities.SiteContent.filter({ section_key: "task_columns" });
      if (records.length > 0 && records[0].data?.columns) {
        setColumns(records[0].data.columns);
      }
    } catch (e) {
      console.error("Failed to load columns:", e);
    }
  }, []);

  const saveColumns = useCallback(async (newColumns) => {
    try {
      const records = await base44.entities.SiteContent.filter({ section_key: "task_columns" });
      if (records.length > 0) {
        await base44.entities.SiteContent.update(records[0].id, { data: { columns: newColumns } });
      } else {
        await base44.entities.SiteContent.create({ section_key: "task_columns", data: { columns: newColumns } });
      }
    } catch (e) {
      console.error("Failed to save columns:", e);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await base44.entities.Task.list("position", 500);
      setTasks(data);
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadColumns(), loadTasks()]).finally(() => setLoading(false));
  }, [loadColumns, loadTasks]);

  const columnIds = columns.map(c => c.id);

  const tasksByColumn = columns.reduce((acc, col, colIdx) => {
    acc[col.id] = tasks
      .filter(t => {
        const taskStatus = t.status || "todo";
        if (colIdx === 0) {
          return taskStatus === col.id || !columnIds.includes(taskStatus);
        }
        return taskStatus === col.id;
      })
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const draggedTask = tasks.find(t => t.id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;
    const destTasks = tasks.filter(t => (t.status || "todo") === newStatus && t.id !== draggableId);
    destTasks.splice(destination.index, 0, { ...draggedTask, status: newStatus });

    const updatedTasks = [...tasks];
    const draggedIdx = updatedTasks.findIndex(t => t.id === draggableId);
    updatedTasks[draggedIdx] = { ...draggedTask, status: newStatus };

    destTasks.forEach((t, i) => {
      const idx = updatedTasks.findIndex(u => u.id === t.id);
      if (idx !== -1) updatedTasks[idx] = { ...updatedTasks[idx], position: i };
    });

    if (source.droppableId !== destination.droppableId) {
      const srcTasks = tasks.filter(t => (t.status || "todo") === source.droppableId && t.id !== draggableId);
      srcTasks.forEach((t, i) => {
        const idx = updatedTasks.findIndex(u => u.id === t.id);
        if (idx !== -1) updatedTasks[idx] = { ...updatedTasks[idx], position: i };
      });
    }

    setTasks(updatedTasks);

    try {
      await base44.entities.Task.update(draggedTask.id, {
        status: newStatus,
        position: destination.index,
      });
    } catch (e) {
      console.error("Failed to update task position:", e);
      loadTasks();
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await base44.entities.Task.update(taskData.id, {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.due_date,
          assigned_to: taskData.assigned_to,
          labels: taskData.labels,
        });
      } else {
        const colTasks = tasks.filter(t => (t.status || "todo") === taskData.status);
        await base44.entities.Task.create({
          ...taskData,
          position: colTasks.length,
        });
      }
      setModalOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (e) {
      console.error("Failed to save task:", e);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await base44.entities.Task.delete(task.id);
      loadTasks();
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  const handleRenameColumn = useCallback((colId, newTitle) => {
    const newColumns = columns.map(c => c.id === colId ? { ...c, title: newTitle } : c);
    setColumns(newColumns);
    saveColumns(newColumns);
  }, [columns, saveColumns]);

  const handleDeleteColumn = useCallback(async (colId) => {
    const colTasks = tasks.filter(t => (t.status || "todo") === colId);
    const remaining = columns.filter(c => c.id !== colId);
    if (remaining.length === 0) return;

    const msg = colTasks.length > 0
      ? `Delete this column and move ${colTasks.length} task(s) to "${remaining[0].title}"?`
      : `Delete this column?`;
    if (!confirm(msg)) return;

    setColumns(remaining);
    saveColumns(remaining);

    if (colTasks.length > 0) {
      const targetCol = remaining[0].id;
      try {
        await Promise.all(colTasks.map(t =>
          base44.entities.Task.update(t.id, { status: targetCol })
        ));
        loadTasks();
      } catch (e) {
        console.error("Failed to move tasks:", e);
      }
    }
  }, [columns, tasks, saveColumns, loadTasks]);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const colId = `col_${Date.now().toString(36)}`;
    const color = COLOR_CYCLE[columns.length % COLOR_CYCLE.length];
    const newColumns = [...columns, { id: colId, title: newColumnTitle.trim(), color }];
    setColumns(newColumns);
    saveColumns(newColumns);
    setNewColumnTitle("");
    setAddingColumn(false);
  };

  const openNewTask = (status = null) => {
    setEditingTask(null);
    setDefaultStatus(status || columns[0]?.id || "todo");
    setModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-hebrew" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-body text-base font-bold text-slate-900 uppercase tracking-tight">Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">{tasks.length} total tasks · Drag cards between columns</p>
        </div>
        <button
          onClick={() => openNewTask()}
          className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-body font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
          {columns.map(col => (
            <TaskColumn
              key={col.id}
              columnId={col.id}
              title={col.title}
              color={col.color}
              tasks={tasksByColumn[col.id] || []}
              onCardClick={openEditTask}
              onCardDelete={handleDeleteTask}
              onAddCard={openNewTask}
              onRename={(newTitle) => handleRenameColumn(col.id, newTitle)}
              onDelete={() => handleDeleteColumn(col.id)}
              canDelete={columns.length > 1}
            />
          ))}

          {/* Add column */}
          {addingColumn ? (
            <div className="flex flex-col w-72 flex-shrink-0 bg-slate-100/70 rounded-xl border border-slate-200 p-3">
              <input
                autoFocus
                value={newColumnTitle}
                onChange={e => setNewColumnTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") { setAddingColumn(false); setNewColumnTitle(""); }
                }}
                onBlur={() => { if (!newColumnTitle.trim()) setAddingColumn(false); }}
                placeholder="Column name..."
                className="w-full bg-white border border-teal-400 rounded-lg px-3 py-2 text-sm font-body text-slate-800 focus:outline-none focus:border-teal-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddColumn}
                  className="flex-1 bg-teal-600 text-white text-xs font-body font-semibold py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Column
                </button>
                <button
                  onClick={() => { setAddingColumn(false); setNewColumnTitle(""); }}
                  className="text-slate-400 hover:text-slate-600 p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="flex flex-col items-center justify-center w-72 flex-shrink-0 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:text-teal-600 hover:border-teal-400 transition-colors py-8"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-body font-medium">Add Column</span>
            </button>
          )}
        </div>
      </DragDropContext>

      {/* Task modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultStatus={defaultStatus}
          columns={columns}
          onSave={handleSaveTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}