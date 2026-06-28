import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  summary: "List user tasks",
  tags: ["Tasks"],
  parameters: [
    { name: "date", in: "query", schema: { type: "string" } },
    {
      name: "status",
      in: "query",
      schema: { type: "string", enum: ["NOT_STARTED", "IN_PROGRESS", "DONE"] },
    },
    { name: "search", in: "query", schema: { type: "string" } },
    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
    {
      name: "limit",
      in: "query",
      schema: { type: "integer", default: 20, maximum: 100 },
    },
  ],
  responses: {
    200: { description: "Array of tasks with pagination" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tasks",
  summary: "Create a task",
  tags: ["Tasks"],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string" },
            status: { type: "string" },
          },
        },
      },
    },
  },
  responses: {
    201: { description: "Task created" },
    400: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  summary: "List user tasks",
  tags: ["Tasks"],
  parameters: [
    { name: "date", in: "query", schema: { type: "string" } },
    {
      name: "status",
      in: "query",
      schema: { type: "string", enum: ["NOT_STARTED", "IN_PROGRESS", "DONE"] },
    },
    { name: "search", in: "query", schema: { type: "string" } },
    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
    {
      name: "limit",
      in: "query",
      schema: { type: "integer", default: 20, maximum: 100 },
    },
  ],
  responses: {
    200: {
      description: "Array of tasks with pagination",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: { type: "array", items: { type: "object" } },
              message: { type: "string" },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  total: { type: "integer" },
                  totalPages: { type: "integer" },
                  hasMore: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/tasks/{id}",
  summary: "Delete a task",
  tags: ["Tasks"],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: { description: "Task deleted" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  summary: "Register a new user",
  tags: ["Auth"],
  responses: {
    201: { description: "User created" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/ai/parse-task",
  summary: "Parse natural language into a task",
  tags: ["AI"],
  responses: {
    200: { description: "Parsed task object" },
  },
});

export function generateOpenAPIDoc() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Planora API",
      version: "1.0.0",
      description: "To-Do List & Calendar API with AI features",
    },
    servers: [{ url: "/", description: "Local development" }],
  });
}
