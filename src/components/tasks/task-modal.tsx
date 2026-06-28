"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { TaskStatus } from "@prisma/client";

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

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    date: string;
    status: TaskStatus;
  }) => void;
  initial?: Task | null;
  defaultDate: string;
}

export default function TaskModal({
  open,
  onClose,
  onSave,
  initial,
  defaultDate,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [status, setStatus] = useState<TaskStatus>("NOT_STARTED");
  const [error, setError] = useState("");
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setDate(initial?.date ?? defaultDate);
      setStatus(initial?.status ?? "NOT_STARTED");
      setError("");
      prevOpenRef.current = true;
    } else if (!open) {
      prevOpenRef.current = false;
    }
  }, [
    open,
    initial?.title,
    initial?.description,
    initial?.date,
    initial?.status,
    defaultDate,
  ]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {initial ? "Edit task" : "New task"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review BRD vs FSD for Paylater"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details about this task…"
              className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {initial ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
