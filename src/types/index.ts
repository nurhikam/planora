import type { TaskStatus } from "@prisma/client";

export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
}
