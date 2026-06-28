import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt-ts";

const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000/api";

const testUser = {
  email: `test_${Date.now()}@test.com`,
  password: "password123",
  name: "Test User",
};

let authToken: string;

describe("Tasks API Integration", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: "test_" } },
    });

    const hashedPassword = await hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash: hashedPassword,
        name: testUser.name,
        emailVerified: new Date(),
      },
    });

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginRes.json();
    authToken = loginData.token;
  }, 30000);

  afterAll(async () => {
    await prisma.task.deleteMany({
      where: {
        userId: (
          await prisma.user.findUnique({ where: { email: testUser.email } })
        )?.id,
      },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: "test_" } },
    });
    await prisma.$disconnect();
  });

  describe("GET /api/tasks", () => {
    it("should return 401 without authentication", async () => {
      const res = await fetch(`${BASE_URL}/tasks`);
      expect(res.status).toBe(401);
    });

    it("should return empty array when no tasks exist", async () => {
      const res = await fetch(`${BASE_URL}/tasks?date=2026-06-29`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: "Test Task",
          description: "Test Description",
          date: "2026-06-29",
          status: "NOT_STARTED",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe("Test Task");
    });

    it("should return 400 for missing title", async () => {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          description: "No title",
          date: "2026-06-29",
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    let createdTaskId: string;

    beforeAll(async () => {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: "Update Test",
          date: "2026-06-29",
          status: "NOT_STARTED",
        }),
      });
      const data = await res.json();
      createdTaskId = data.id;
    });

    it("should update task status", async () => {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("IN_PROGRESS");
    });

    it("should update task title", async () => {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: "Updated Title" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe("Updated Title");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    let createdTaskId: string;

    beforeAll(async () => {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: "Delete Test",
          date: "2026-06-29",
        }),
      });
      const data = await res.json();
      createdTaskId = data.id;
    });

    it("should delete a task", async () => {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
    });

    it("should not return deleted task", async () => {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(404);
    });
  });
});
