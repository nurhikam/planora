"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

interface SortableTaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function SortableTaskCard({
  task,
  onUpdateStatus,
  onDelete,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusStyles = {
    NOT_STARTED:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    IN_PROGRESS:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  const statusLabels = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-grab"
          >
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3
              className={`font-medium ${task.status === "DONE" ? "line-through text-zinc-400" : ""}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-zinc-500">{task.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="ml-2 text-zinc-400 hover:text-red-500"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <select
          value={task.status}
          onChange={(e) =>
            onUpdateStatus(task.id, e.target.value as TaskStatus)
          }
          className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyles[task.status]}`}
        >
          <option value="NOT_STARTED">{statusLabels.NOT_STARTED}</option>
          <option value="IN_PROGRESS">{statusLabels.IN_PROGRESS}</option>
          <option value="DONE">{statusLabels.DONE}</option>
        </select>
      </div>
    </div>
  );
}
