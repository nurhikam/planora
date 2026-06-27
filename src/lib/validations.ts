import { z } from "zod";
import { TaskStatus } from "@prisma/client";

export const taskStatusEnum = z.nativeEnum(TaskStatus);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  status: taskStatusEnum.default("NOT_STARTED"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .optional(),
  status: taskStatusEnum.optional(),
});

export const taskQuerySchema = z.object({
  date: z.string().optional(),
  status: taskStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const aiParseTaskSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  date: z.string(),
  status: taskStatusEnum.default("NOT_STARTED"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
