import { authService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Token is required" }, { status: 400 });
    }

    await authService.verifyEmail(token);

    return Response.redirect(new URL("/login?verified=true", request.url), 307);
  } catch (error) {
    return handleApiError(error);
  }
}
