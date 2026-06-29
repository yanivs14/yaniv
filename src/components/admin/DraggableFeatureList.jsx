import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2, GripVertical, Plus } from "lucide-react";

export default function DraggableFeatureList({ features, onChange, addLabel = "Add feature" }) {
  const items = features || [];

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...items];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered);
  };

  const updateItem = (i, val) => {
    const arr = [...items];
    arr[i] = val;
    onChange(arr);
  };

  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="feature-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((feat, i) => (
                <Draggable key={`feat-${i}`} draggableId={`feat-${i}`} index={i}>
                  {(prov, snapshot) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className={`flex gap-2 mb-2 items-center rounded-lg border border-[#2a2a2a] px-2 py-1.5 bg-[#111] ${snapshot.isDragging ? "opacity-80 shadow-lg border-orange-red/40" : ""}`}
                    >
                      <span {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-white-dim hover:text-orange-red transition-colors flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-white-dim font-body w-5 text-center flex-shrink-0">{i + 1}</span>
                      <input
                        value={feat}
                        onChange={(e) => updateItem(i, e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-0 text-sm text-off-white font-body focus:outline-none focus:text-orange-red transition-colors"
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-2 text-sm text-orange-red hover:text-orange-red-hover transition-colors mt-2"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}