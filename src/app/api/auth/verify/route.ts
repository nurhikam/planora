import { authService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/errors";
import { verifyRateLimiter, checkRateLimit } from "@/lib/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rateLimit = await checkRateLimit(verifyRateLimiter, ip);

    if (!rateLimit.success) {
      return Response.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429 },
      );
    }

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
