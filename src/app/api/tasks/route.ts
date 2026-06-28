import { auth } from "@/lib/auth";
import { taskService } from "@/lib/services/task.service";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { handleApiError, AuthError, ValidationError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { searchParams } = new URL(request.url);
    const filters = taskQuerySchema.parse({
      date: searchParams.get("date") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    });

    const result = await taskService.listTasks(session.user.id, filters);
    return Response.json({
      data: result.items,
      message: "Tasks retrieved successfully",
      pagination: result.pagination,
    });
  } catch (error) {
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
