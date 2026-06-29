"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const { data } = useSWR(`/api/tasks`, fetcher);
  const tasks = (data?.data || []) as Task[];

  function getTasksForDay(day: Date) {
    return tasks.filter((task) => isSameDay(new Date(task.date), day));
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "DONE":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      default:
        return "bg-zinc-400";
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Calendar
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          View and manage your tasks across all dates
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const cells = [];
              let day = startDate;
              while (day <= endDate) {
                const dayTasks = getTasksForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, monthStart);

                cells.push(
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative min-h-[100px] p-2 rounded-lg border transition-all
                      ${!isCurrentMonth ? "bg-zinc-50 dark:bg-zinc-900/50" : "bg-white dark:bg-[#0A0A0A]"}
                      ${isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-zinc-200 dark:border-zinc-800"}
                      ${isToday && !isSelected ? "border-blue-300 dark:border-blue-700" : ""}
                      hover:border-blue-400 dark:hover:border-blue-600
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`
                        text-sm font-medium
                        ${!isCurrentMonth ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}
                        ${isToday ? "text-blue-600 dark:text-blue-400 font-semibold" : ""}
                      `}
                      >
                        {format(day, "d")}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Task Indicators */}
                    <div className="flex flex-col gap-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-1.5"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getStatusColor(task.status)}`}
                          />
                          <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>,
                );

                day = addDays(day, 1);
              }
              return cells;
            })()}
          </div>
        </div>

        {/* Selected Date Tasks */}
        {(() => {
          const selectedTasks = getTasksForDay(selectedDate);
          return (
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Tasks for {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              {selectedTasks.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No tasks scheduled for this date
                </p>
              ) : (
                <div className="grid gap-2">
                  {selectedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-0.5 h-6 ${
                          task.status === "DONE"
                            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                            : task.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {task.status === "DONE"
                          ? "Done"
                          : task.status === "IN_PROGRESS"
                            ? "In Progress"
                            : "Not Started"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
