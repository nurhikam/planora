import { describe, it, expect, beforeEach, vi } from "vitest";
import { taskService } from "@/lib/services/task.service";
import { taskRepository } from "@/lib/repositories/task.repository";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { TaskStatus } from "@prisma/client";

vi.mock("@/lib/repositories/task.repository");
vi.mock("@/lib/prisma");

describe("TaskService", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
  };

  const mockTask = {
    id: "task-123",
    title: "Test Task",
    description: "Test Description",
    date: new Date("2026-06-28"),
    status: TaskStatus.NOT_STARTED,
    userId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTasks", () => {
    it("returns all tasks for user with pagination", async () => {
      const tasks = [mockTask, { ...mockTask, id: "task-456" }];
      vi.mocked(taskRepository.findByUser).mockResolvedValue(tasks);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(2);

      const result = await taskService.listTasks(mockUser.id);

      expect(result.items).toEqual(tasks);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasMore: false,
      });
    });

    it("filters tasks by date", async () => {
      vi.mocked(taskRepository.findByUser).mockResolvedValue([mockTask]);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(1);

      await taskService.listTasks(mockUser.id, { date: "2026-06-28" });

      expect(taskRepository.findByUser).toHaveBeenCalledWith(mockUser.id, {
        date: "2026-06-28",
      });
    });

    it("filters tasks by status", async () => {
      vi.mocked(taskRepository.findByUser).mockResolvedValue([mockTask]);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(1);

      await taskService.listTasks(mockUser.id, {
        status: TaskStatus.IN_PROGRESS,
      });

      expect(taskRepository.findByUser).toHaveBeenCalledWith(mockUser.id, {
        status: TaskStatus.IN_PROGRESS,
      });
    });

    it("searches tasks by keyword", async () => {
      vi.mocked(taskRepository.findByUser).mockResolvedValue([mockTask]);
      vi.mocked(taskRepository.countByUser).mockResolvedValue(1);

      await taskService.listTasks(mockUser.id, { search: "Test" });

      expect(taskRepository.findByUser).toHaveBeenCalledWith(mockUser.id, {
        search: "Test",
      });
    });
  });

  describe("getTask", () => {
    it("returns task if it belongs to user", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      const result = await taskService.getTask(mockTask.id, mockUser.id);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(mockTask.id);
    });

    it("throws NotFoundError if task does not exist", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.getTask("non-existent", mockUser.id),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if task belongs to different user", async () => {
      const otherUserTask = { ...mockTask, userId: "other-user" };
      vi.mocked(taskRepository.findById).mockResolvedValue(otherUserTask);

      await expect(
        taskService.getTask(mockTask.id, mockUser.id),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("createTask", () => {
    it("creates task with valid data", async () => {
      const taskData = {
        title: "New Task",
        description: "Task description",
        date: "2026-06-28",
        status: TaskStatus.NOT_STARTED,
        userId: mockUser.id,
      };

      vi.mocked(taskRepository.create).mockResolvedValue({
        ...mockTask,
        ...taskData,
        date: new Date(taskData.date),
      });

      const result = await taskService.createTask(taskData);

      expect(result.title).toBe("New Task");
      expect(taskRepository.create).toHaveBeenCalledWith({
        title: "New Task",
        description: "Task description",
        date: new Date("2026-06-28"),
        status: TaskStatus.NOT_STARTED,
        userId: mockUser.id,
      });
    });

    it("sets default status to NOT_STARTED", async () => {
      const taskData = {
        title: "New Task",
        date: "2026-06-28",
        userId: mockUser.id,
      };

      vi.mocked(taskRepository.create).mockResolvedValue({
        ...mockTask,
        ...taskData,
        date: new Date(taskData.date),
        status: TaskStatus.NOT_STARTED,
      });

      await taskService.createTask(taskData);

      expect(taskRepository.create).toHaveBeenCalledWith({
        title: "New Task",
        description: undefined,
        date: new Date("2026-06-28"),
        status: undefined,
        userId: mockUser.id,
      });
    });
  });

  describe("updateTask", () => {
    it("updates task if it belongs to user", async () => {
      const updateData = {
        title: "Updated Title",
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = { ...mockTask, ...updateData };

      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(taskRepository.update).mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(
        mockTask.id,
        mockUser.id,
        updateData,
      );

      expect(result.title).toBe("Updated Title");
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("throws NotFoundError if task does not exist", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.updateTask("non-existent", mockUser.id, {
          title: "Updated",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if updating other user task", async () => {
      const otherUserTask = { ...mockTask, userId: "other-user" };
      vi.mocked(taskRepository.findById).mockResolvedValue(otherUserTask);

      await expect(
        taskService.updateTask(mockTask.id, mockUser.id, { title: "Hacked" }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("deleteTask", () => {
    it("deletes task if it belongs to user", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(taskRepository.delete).mockResolvedValue(mockTask);

      await taskService.deleteTask(mockTask.id, mockUser.id);

      expect(taskRepository.delete).toHaveBeenCalledWith(mockTask.id);
    });

    it("throws NotFoundError if task does not exist", async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      await expect(
        taskService.deleteTask("non-existent", mockUser.id),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if deleting other user task", async () => {
      const otherUserTask = { ...mockTask, userId: "other-user" };
      vi.mocked(taskRepository.findById).mockResolvedValue(otherUserTask);

      await expect(
        taskService.deleteTask(mockTask.id, mockUser.id),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
