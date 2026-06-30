"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskStatus } from "@prisma/client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, GripVertical } from "lucide-react";

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
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: task.id,
      transition: { duration: 150, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 150ms ease",
    opacity: isDragging ? 0.5 : task.status === "DONE" ? 0.6 : 1,
  };

  const isDone = task.status === "DONE";

  function handleToggle() {
    onUpdateStatus(task.id, isDone ? "NOT_STARTED" : "DONE");
  }

  function handleStatusChange() {
    if (task.status === "NOT_STARTED") onUpdateStatus(task.id, "IN_PROGRESS");
    else if (task.status === "IN_PROGRESS") onUpdateStatus(task.id, "DONE");
    else onUpdateStatus(task.id, "NOT_STARTED");
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-4 rounded-xl border bg-white dark:bg-[#0C0C0C] p-4 shadow-sm transition-all duration-200 ${
        isDragging
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xl scale-[1.01] z-50"
          : isDone
            ? "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md opacity-75"
            : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg"
      }`}
    >
      <div className="mt-0.5 flex-shrink-0 flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          role="button"
          tabIndex={0}
          aria-label="Drag to reorder task"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              listeners?.onKeyDown(e);
            }
          }}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-500 cursor-grab active:cursor-grabbing hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </div>
        <Checkbox
          checked={isDone}
          onCheckedChange={handleToggle}
          aria-label={isDone ? "Mark as not started" : "Mark as done"}
          className={`h-5 w-5 rounded-full border-2 transition-all duration-200
            ${
              isDone
                ? "border-green-500 bg-green-500 hover:bg-green-600"
                : "border-zinc-300 dark:border-zinc-600 hover:border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3 flex-wrap">
          <h3
            className={`text-sm font-semibold truncate flex-1 min-w-0 ${
              isDone
                ? "text-zinc-400 line-through"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {task.title}
          </h3>

          {/* Click badge to cycle status */}
          <button
            onClick={handleStatusChange}
            className="focus:outline-none -mr-1"
          >
            {task.status === "IN_PROGRESS" && (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30 font-medium text-xs px-2.5 py-0.5 h-6 transition-all shadow-sm"
              >
                In Progress
              </Badge>
            )}
            {task.status === "NOT_STARTED" && (
              <Badge
                variant="secondary"
                className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 font-medium text-xs px-2.5 py-0.5 h-6 transition-all shadow-sm"
              >
                Not Started
              </Badge>
            )}
            {task.status === "DONE" && (
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/60 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30 font-medium text-xs px-2.5 py-0.5 h-6 transition-all shadow-sm"
              >
                Done
              </Badge>
            )}
          </button>
        </div>

        {task.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1.5 rounded-md">
            <Clock
              className="mr-1.5 h-3.5 w-3.5 text-zinc-400"
              aria-hidden="true"
            />
            Due{" "}
            {new Date(task.date).toLocaleDateString("id-ID", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          title="Delete task"
          className="h-9 w-9 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
