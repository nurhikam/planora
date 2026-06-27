"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import useSWR from "swr";
import type { TaskStatus } from "@prisma/client";
import toast from "react-hot-toast";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/tasks?date=${dateStr}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        date: dateStr,
        status: "NOT_STARTED",
      }),
    });
    if (res.ok) {
      toast.success("Task created");
      setTitle("");
      setDescription("");
      setShowForm(false);
      mutate();
    } else {
      toast.error("Failed to create task");
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Status updated");
      mutate();
    }
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Task deleted");
      mutate();
    }
  }

  const params = new URLSearchParams({ date: dateStr });
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (search) params.set("search", search);

  const { data, mutate, isLoading } = useSWR(`/api/tasks?${params}`, fetcher);
  const tasks = (data?.items || []) as Task[];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const statusCounts = {
    NOT_STARTED: tasks.filter((t: Task) => t.status === "NOT_STARTED").length,
    IN_PROGRESS: tasks.filter((t: Task) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t: Task) => t.status === "DONE").length,
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_240px]">
        {/* Sidebar - Calendar */}
        <aside className="space-y-6">
          {/* Quick Add */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> New Task
          </button>

          {/* Calendar */}
          <div className="rounded-lg border border-border p-3">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ←
              </button>
              <span className="text-xs font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="space-y-1">
              {(() => {
                const rows = [];
                let days = [];
                let day = startDate;
                while (day <= endDate) {
                  for (let i = 0; i < 7; i++) {
                    const currentDay = day;
                    days.push(
                      <button
                        key={currentDay.toISOString()}
                        onClick={() => setSelectedDate(currentDay)}
                        className={`h-7 w-full text-xs rounded transition-colors
                          ${!isSameMonth(currentDay, monthStart) ? "text-muted-foreground/50" : ""}
                          ${isSameDay(currentDay, selectedDate) ? "bg-primary text-primary-foreground" : ""}
                          ${isSameDay(currentDay, new Date()) && !isSameDay(currentDay, selectedDate) ? "border border-border font-medium" : ""}
                          hover:bg-muted`}
                      >
                        {format(currentDay, "d")}
                      </button>,
                    );
                    day = addDays(day, 1);
                  }
                  rows.push(
                    <div
                      key={day.toISOString()}
                      className="grid grid-cols-7 gap-1"
                    >
                      {days}
                    </div>,
                  );
                  days = [];
                }
                return rows;
              })()}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Summary
            </h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />{" "}
                  Not Started
                </span>
                <span className="font-medium">{statusCounts.NOT_STARTED}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />{" "}
                  In Progress
                </span>
                <span className="font-medium">{statusCounts.IN_PROGRESS}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />{" "}
                  Done
                </span>
                <span className="font-medium">{statusCounts.DONE}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main - Task List */}
        <main className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-base font-medium">
                {format(selectedDate, "EEEE, MMM d")}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TaskStatus | "ALL")
              }
              className="h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="ALL">All</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Add Task Form */}
          {showForm && (
            <form
              onSubmit={createTask}
              className="mb-4 rounded-lg border border-border p-3 space-y-3"
            >
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-8 px-3 rounded-md border border-input bg-background text-xs hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Task List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-xs text-muted-foreground">
                No tasks for this day
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-xs text-foreground hover:underline"
              >
                Create one
              </button>
            </div>
          ) : (
            <SortableTaskList
              tasks={tasks}
              onUpdateStatus={updateTaskStatus}
              onDelete={deleteTask}
            />
          )}
        </main>
      </div>
    </div>
  );
}

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
