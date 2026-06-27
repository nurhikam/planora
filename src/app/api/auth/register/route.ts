import { authService } from "@/lib/services/auth.service";
import { emailService } from "@/lib/services/email.service";
import { registerSchema } from "@/lib/validations";
import { handleApiError, ValidationError } from "@/lib/errors";
import { registerRateLimiter, checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    console.log("Registration request from IP:", ip);

    const rateLimit = await checkRateLimit(registerRateLimiter, ip);

    if (!rateLimit.success) {
      console.log("Rate limit exceeded for IP:", ip);
      return Response.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.log("Validation failed:", parsed.error.issues);
      throw new ValidationError(parsed.error.issues);
    }

    const { name, email, password } = parsed.data;
    console.log("Creating user:", { name, email });

    const { user, token } = await authService.register(name, email, password);

    await emailService.sendVerificationEmail(user.email, token);

    console.log("User created successfully:", user.id);

    return Response.json(
      {
        data: { id: user.id, name: user.name, email: user.email },
        message: "User created. Check your email to verify.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return handleApiError(error);
  }
}
