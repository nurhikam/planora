import { auth } from "@/lib/auth";
import { taskService } from "@/lib/services/task.service";
import { aiService } from "@/lib/services/ai.service";
import { handleApiError, AuthError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await request.json()) as any;
    const date = body.date as string;
    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    const result = await taskService.listTasks(session.user.id, { date });
    const textStream = await aiService.summarizeTasks(result.items, date);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
