"use client";

import {
  DndContext,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "./sortable-task-card";
import type { TaskStatus } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SortableTaskListProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onReorder?: (tasks: Task[]) => void;
}

export function SortableTaskList({
  tasks,
  onUpdateStatus,
  onDelete,
  onReorder,
}: SortableTaskListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newTasks = arrayMove(tasks, oldIndex, newIndex);
    onReorder?.(newTasks);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tasks.length > 1 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                💡
              </span>
              Drag tasks using the grip icon to reorder
            </p>
          )}
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
