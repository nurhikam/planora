import { taskRepository } from "@/lib/repositories/task.repository";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import type { TaskStatus } from "@prisma/client";

export const taskService = {
  async listTasks(
    userId: string,
    filters?: {
      date?: string;
      status?: TaskStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const [tasks, total] = await Promise.all([
      taskRepository.findByUser(userId, filters),
      taskRepository.countByUser(userId, filters),
    ]);

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;

    return {
      items: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  },

  async getTask(id: string, userId: string) {
    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError("Task");
    if (task.userId !== userId) throw new ForbiddenError();
    return task;
  },

  async createTask(data: {
    title: string;
    description?: string;
    date: string;
    status?: TaskStatus;
    userId: string;
  }) {
    return taskRepository.create({
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      status: data.status,
      userId: data.userId,
    });
  },

  async updateTask(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      status?: TaskStatus;
    },
  ) {
    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError("Task");
    if (task.userId !== userId) throw new ForbiddenError();

    return taskRepository.update(id, {
      title: data.title,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      status: data.status,
    });
  },

  async deleteTask(id: string, userId: string) {
    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError("Task");
    if (task.userId !== userId) throw new ForbiddenError();

    return taskRepository.delete(id);
  },
};
