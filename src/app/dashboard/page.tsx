"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/app-shell";
import Calendar from "@/components/tasks/calendar";
import StatusSummary from "@/components/tasks/status-summary";
import TaskModal from "@/components/tasks/task-modal";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title-asc" | "title-desc"
  >("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const dateStr = selectedDate;
  const params = new URLSearchParams({ date: dateStr });
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  params.set("sort", sortBy);
  const { data, mutate, isLoading } = useSWR(`/api/tasks?${params}`, fetcher);
  const tasks = (data?.data || []) as Task[];

  const tasksOnSelectedDate = useMemo(() => {
    return tasks.filter((t) => t.date.split("T")[0] === dateStr);
  }, [tasks, dateStr]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading Planora...
          </p>
        </div>
      </div>
    );
  }

  async function createTask(data: {
    title: string;
    description: string;
    date: string;
    status: TaskStatus;
  }) {
    const res = await fetch(`/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        date: data.date,
        status: data.status,
      }),
    });
    if (res.ok) {
      toast.success("Task created");
      setModalOpen(false);
      await mutate();
    } else {
      const error = await res.json();
      toast.error(error.message || "Failed to create task");
    }
  }

  async function updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      date?: string;
    },
  ) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Task updated");
      setModalOpen(false);
      await mutate();
    } else {
      toast.error("Failed to update task");
    }
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Task deleted");
      setTaskToDelete(null);
      mutate();
    } else {
      toast.error("Failed to delete task");
    }
  }

  async function handleAddTask(suggestion: {
    title: string;
    description: string;
    date: string;
    status: string;
  }) {
    const res = await fetch(`/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: suggestion.title,
        description: suggestion.description,
        date: suggestion.date,
        status: suggestion.status as TaskStatus,
      }),
    });
    if (res.ok) {
      toast.success("Task added!");
      mutate();
    } else {
      const error = await res.json();
      toast.error(error.message || "Failed to add task");
    }
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  async function handleSave(data: {
    title: string;
    description: string;
    date: string;
    status: TaskStatus;
  }) {
    if (editing) {
      await updateTask(editing.id, data);
    } else {
      await createTask(data);
    }
  }

  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Hi, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Here&apos;s what&apos;s planned and how it&apos;s tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-[200px]">
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TaskStatus | "ALL")
            }
            className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </div>

      <div className="mb-5">
        <StatusSummary tasks={tasks} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-5">
          <Calendar
            month={month}
            setMonth={setMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            tasks={tasks}
          />
          <AIAssistant
            selectedDate={selectedDate}
            tasks={tasksOnSelectedDate}
            onAddTask={handleAddTask}
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {format(new Date(selectedDate), "EEEE, MMM d")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {tasksOnSelectedDate.length}{" "}
                {tasksOnSelectedDate.length === 1 ? "task" : "tasks"}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              + Add Task
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tasksOnSelectedDate.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-12 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 shadow-sm">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                No tasks yet
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs">
                You have a clear day ahead! Create a task manually or let AI
                suggest one for you.
              </p>
              <button
                onClick={openCreate}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Create Task
              </button>
            </div>
          ) : (
            <SortableTaskList
              tasks={tasksOnSelectedDate}
              onUpdateStatus={async (taskId, status) => {
                await updateTask(taskId, { status });
              }}
              onDelete={async (taskId) => setTaskToDelete(taskId)}
            />
          )}
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
        defaultDate={selectedDate}
      />

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Delete Task?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this task? It will be permanently
              removed from your calendar.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTask(taskToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
