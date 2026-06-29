import { auth } from "@/lib/auth";
import { taskService } from "@/lib/services/task.service";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { handleApiError, AuthError, ValidationError } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    console.log("[GET /api/tasks] Starting request");
    const session = await auth();
    console.log(
      "[GET /api/tasks] Session:",
      session?.user?.id ? "authenticated" : "unauthenticated",
    );
    if (!session?.user?.id) throw new AuthError();

    const { searchParams } = new URL(request.url);
    const filters = taskQuerySchema.parse({
      date: searchParams.get("date") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || "newest",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    });
    console.log("[GET /api/tasks] Filters:", filters);

    console.log("[GET /api/tasks] Calling taskService.listTasks");
    const result = await taskService.listTasks(session.user.id, filters);
    console.log(
      "[GET /api/tasks] Success, found",
      result.items.length,
      "tasks",
    );
    return Response.json({
      data: result.items,
      message: "Tasks retrieved successfully",
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[GET /api/tasks] Error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);

    const task = await taskService.createTask({
      ...parsed.data,
      userId: session.user.id,
    });

    return Response.json(
      { data: task, message: "Task created" },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
