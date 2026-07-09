import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TaskColumn from "./tasks/TaskColumn";
import TaskModal from "./tasks/TaskModal";

const COLUMNS = ["backlog", "todo", "in_progress", "review", "done"];

export default function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  const loadTasks = useCallback(async () => {
    try {
      const data = await base44.entities.Task.list("position", 500);
      setTasks(data);
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter(t => (t.status || "todo") === col).sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {});

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const draggedTask = tasks.find(t => t.id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;

    // Get tasks in the destination column (excluding dragged)
    const destTasks = tasks.filter(t => (t.status || "todo") === newStatus && t.id !== draggableId);
    // Insert at new position
    destTasks.splice(destination.index, 0, { ...draggedTask, status: newStatus });

    // Optimistic update
    const updatedTasks = [...tasks];
    const draggedIdx = updatedTasks.findIndex(t => t.id === draggableId);
    updatedTasks[draggedIdx] = { ...draggedTask, status: newStatus };

    // Recalculate positions for affected tasks
    destTasks.forEach((t, i) => {
      const idx = updatedTasks.findIndex(u => u.id === t.id);
      if (idx !== -1) updatedTasks[idx] = { ...updatedTasks[idx], position: i };
    });

    // Also recalculate source column positions if different column
    if (source.droppableId !== destination.droppableId) {
      const srcTasks = tasks.filter(t => (t.status || "todo") === source.droppableId && t.id !== draggableId);
      srcTasks.forEach((t, i) => {
        const idx = updatedTasks.findIndex(u => u.id === t.id);
        if (idx !== -1) updatedTasks[idx] = { ...updatedTasks[idx], position: i };
      });
    }

    setTasks(updatedTasks);

    // Persist changes to backend
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
        // Calculate position for new task
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

  const openNewTask = (status = "todo") => {
    setEditingTask(null);
    setDefaultStatus(status);
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-body text-base font-bold text-slate-900 uppercase tracking-tight">Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">{tasks.length} total tasks · Drag cards between columns</p>
        </div>
        <button
          onClick={() => openNewTask("todo")}
          className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-body font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {COLUMNS.map(col => (
            <TaskColumn
              key={col}
              columnKey={col}
              tasks={tasksByColumn[col]}
              onCardClick={openEditTask}
              onCardDelete={handleDeleteTask}
              onAddCard={openNewTask}
            />
          ))}
        </DragDropContext>
      </div>

      {/* Task modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultStatus={defaultStatus}
          onSave={handleSaveTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}