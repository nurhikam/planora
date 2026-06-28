import { auth } from "@/lib/auth";
import { taskService } from "@/lib/services/task.service";
import { updateTaskSchema } from "@/lib/validations";
import { handleApiError, AuthError, ValidationError } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { id } = await params;
    const task = await taskService.getTask(id, session.user.id);
    return Response.json({
      data: task,
      message: "Task retrieved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues);

    const task = await taskService.updateTask(id, session.user.id, parsed.data);
    return Response.json({ data: task, message: "Task updated" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { id } = await params;
    await taskService.deleteTask(id, session.user.id);
    return Response.json({ message: "Task deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
