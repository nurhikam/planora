"use client";

import { useMemo } from "react";
import {
  addMonths,
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface CalendarProps {
  month: Date;
  setMonth: (d: Date) => void;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  tasks: Task[];
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function Calendar({
  month,
  setMonth,
  selectedDate,
  onSelectDate,
  tasks,
}: CalendarProps) {
  const days = useMemo(() => {
    // @ts-expect-error - date-fns v4 type issues
    const start = startOfWeek(startOfMonth(month), { locale: id });
    // @ts-expect-error - date-fns v4 type issues
    const end = endOfWeek(endOfMonth(month), { locale: id });
    const result: Date[] = [];
    let current = start;
    while (current <= end) {
      result.push(current);
      current = addDays(current, 1);
    }
    return result;
  }, [month]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return map;
  }, [tasks]);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(subMonths(month, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Today
          </button>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center font-mono text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate.get(iso) ?? [];
          const inMonth = isSameMonth(day, month);
          const selected = isSameDay(day, new Date(selectedDate));
          const today = isSameDay(day, new Date());

          const counts = {
            NOT_STARTED: dayTasks.filter((t) => t.status === "NOT_STARTED")
              .length,
            IN_PROGRESS: dayTasks.filter((t) => t.status === "IN_PROGRESS")
              .length,
            DONE: dayTasks.filter((t) => t.status === "DONE").length,
          };
          const total = dayTasks.length;

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={`group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-sm transition ${
                selected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              } ${!inMonth ? "opacity-35" : ""}`}
            >
              <span
                className={`font-mono text-[13px] ${
                  today
                    ? "font-bold text-blue-600 dark:text-blue-400"
                    : selected
                      ? "font-semibold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {format(day, "d")}
              </span>

              {total > 0 ? (
                <div className="flex h-[3px] w-7 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {counts.NOT_STARTED > 0 && (
                    <div
                      style={{ flex: counts.NOT_STARTED }}
                      className="bg-zinc-400"
                    />
                  )}
                  {counts.IN_PROGRESS > 0 && (
                    <div
                      style={{ flex: counts.IN_PROGRESS }}
                      className="bg-blue-500"
                    />
                  )}
                  {counts.DONE > 0 && (
                    <div
                      style={{ flex: counts.DONE }}
                      className="bg-green-500"
                    />
                  )}
                </div>
              ) : (
                <div className="h-[3px] w-7" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
