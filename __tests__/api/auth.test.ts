import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000/api";

const testUser = {
  email: `test_auth_${Date.now()}@test.com`,
  password: "password123",
  name: "Test Auth User",
};

describe("Auth API Integration", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: "test_auth_" } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: "test_auth_" } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testUser.email);
      expect(data.token).toBeDefined();
    });

    it("should return 400 for existing email", async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          name: "Duplicate User",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid email", async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: testUser.password,
          name: "Invalid User",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `short_${Date.now()}@test.com`,
          password: "123",
          name: "Short Password",
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(testUser.email);
    });

    it("should return 401 for wrong password", async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "wrongpassword",
        }),
      });

      expect(res.status).toBe(401);
    });

    it("should return 401 for non-existent user", async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@test.com",
          password: testUser.password,
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken: string;

    beforeAll(async () => {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      const data = await loginRes.json();
      authToken = data.token;
    });

    it("should return current user with valid token", async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.email).toBe(testUser.email);
    });

    it("should return 401 without token", async () => {
      const res = await fetch(`${BASE_URL}/auth/me`);
      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: "Bearer invalid_token" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/verify", () => {
    it("should verify email with valid token", async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const jwt = await import("jsonwebtoken");
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "24h" },
      );

      const res = await fetch(`${BASE_URL}/auth/verify?token=${token}`);
      expect(res.status).toBe(307);
    });

    it("should return 400 for invalid token", async () => {
      const res = await fetch(`${BASE_URL}/auth/verify?token=invalid`);
      expect(res.status).toBe(400);
    });
  });
});
