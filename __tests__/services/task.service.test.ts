import { describe, it, expect, beforeEach, vi } from "vitest";
import { taskService } from "@/lib/services/task.service";
import { taskRepository } from "@/lib/repositories/task.repository";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import type { Task } from "@prisma/client";

vi.mock("@/lib/repositories/task.repository", () => ({
  taskRepository: {
    findById: vi.fn(),
    findByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countByUser: vi.fn(),
  },
}));

describe("TaskService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTasks", () => {
    it("returns tasks for user", async () => {
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Task 1",
          description: "",
          date: new Date(),
          status: "NOT_STARTED",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "user-1",
        },
        {
          id: "2",
          title: "Task 2",
          description: "",
          date: new Date(),
          status: "NOT_STARTED",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "user-1",
        },
      ];
      vi.mocked(taskRepository.findByUser).mockResolvedValue(mockTasks);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(2);

      const result = await taskService.listTasks("user-1");

      expect(result.items).toEqual(mockTasks);
      expect(result.pagination.total).toBe(2);
      expect(taskRepository.findByUser).toHaveBeenCalledWith(
        "user-1",
        undefined,
      );
    });

    it("filters tasks by date", async () => {
      vi.mocked(taskRepository.findByUser).mockResolvedValue([]);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(0);

      await taskService.listTasks("user-1", { date: "2026-06-28" });

      expect(taskRepository.findByUser).toHaveBeenCalledWith("user-1", {
        date: "2026-06-28",
      });
    });

    it("supports pagination", async () => {
      vi.mocked(taskRepository.findByUser).mockResolvedValue([]);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(0);

      await taskService.listTasks("user-1", { page: 2, limit: 10 });

      expect(taskRepository.findByUser).toHaveBeenCalledWith("user-1", {
        page: 2,
        limit: 10,
      });
    });
  });

  describe("getTask", () => {
    it("returns task if owned by user", async () => {
      const mockTask: Task = {
        id: "1",
        title: "Task 1",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
      };
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      const result = await taskService.getTask("1", "user-1");

      expect(result).toEqual(mockTask);
    });

    it("throws NotFoundError if task not found", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(taskService.getTask("1", "user-1")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError if task not owned by user", async () => {
      const mockTask: Task = {
        id: "1",
        title: "Task 1",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-2",
      };
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      await expect(taskService.getTask("1", "user-1")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("createTask", () => {
    it("creates task with valid data", async () => {
      const mockTask: Task = {
        id: "1",
        title: "New Task",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
      };
      vi.mocked(taskRepository.create).mockResolvedValue(mockTask);

      const result = await taskService.createTask({
        title: "New Task",
        date: "2026-06-28",
        userId: "user-1",
      });

      expect(result).toEqual(mockTask);
      expect(taskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          date: expect.any(Date),
          userId: "user-1",
        }),
      );
    });
  });

  describe("updateTask", () => {
    it("updates task if owned by user", async () => {
      const existingTask: Task = {
        id: "1",
        title: "Old Title",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
      };
      const updatedTask: Task = { ...existingTask, title: "New Title" };
      vi.mocked(taskRepository.findById).mockResolvedValue(existingTask);
      vi.mocked(taskRepository.update).mockResolvedValue(updatedTask);

      const result = await taskService.updateTask("1", "user-1", {
        title: "New Title",
      });

      expect(result).toEqual(updatedTask);
      expect(taskRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ title: "New Title" }),
      );
    });

    it("throws NotFoundError if task not found", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.updateTask("1", "user-1", { title: "New" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if task not owned by user", async () => {
      const mockTask: Task = {
        id: "1",
        title: "Task",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-2",
      };
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      await expect(
        taskService.updateTask("1", "user-1", { title: "New" }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("deleteTask", () => {
    it("deletes task if owned by user", async () => {
      const mockTask: Task = {
        id: "1",
        title: "Task",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
      };
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(taskRepository.delete).mockResolvedValue(mockTask);

      await taskService.deleteTask("1", "user-1");

      expect(taskRepository.delete).toHaveBeenCalledWith("1");
    });

    it("throws NotFoundError if task not found", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(taskService.deleteTask("1", "user-1")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError if task not owned by user", async () => {
      const mockTask: Task = {
        id: "1",
        title: "Task",
        description: "",
        date: new Date(),
        status: "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-2",
      };
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      await expect(taskService.deleteTask("1", "user-1")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("validation schema", () => {
    it("validates task creation schema", async () => {
      const { createTaskSchema } = await import("@/lib/validations");
      const result = createTaskSchema.safeParse({
        title: "Test",
        date: "2026-06-28",
      });
      expect(result.success).toBe(true);
    });

    it("rejects task without title", async () => {
      const { createTaskSchema } = await import("@/lib/validations");
      const result = createTaskSchema.safeParse({ date: "2026-06-28" });
      expect(result.success).toBe(false);
    });
  });
});
