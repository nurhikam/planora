import { auth } from "@/lib/auth";
import { aiService } from "@/lib/services/ai.service";
import { handleApiError, AuthError } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { input } = await request.json();
    if (!input || typeof input !== "string") {
      return Response.json({ error: "Input is required" }, { status: 400 });
    }

    const result = await aiService.parseTask(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
