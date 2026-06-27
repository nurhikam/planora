"use client";

import useSWR from "swr";
import type { TaskStatus } from "@prisma/client";

interface PaginatedTasks {
  items: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PaginatedTasks>;

export function useTasks(filters?: {
  date?: string;
  status?: TaskStatus;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.date) params.set("date", filters.date);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);

  const query = params.toString();
  const { data, error, mutate, isLoading } = useSWR(
    `/api/tasks${query ? `?${query}` : ""}`,
    fetcher,
  );

  return {
    tasks: (data?.items || []) as Task[],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useCalendar() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  return {
    today,
    startOfMonth,
    daysInMonth,
    month: today.toLocaleString("default", { month: "long" }),
    year: today.getFullYear(),
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
