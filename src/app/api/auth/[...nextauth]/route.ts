import { handlers } from "@/lib/auth";
import { loginRateLimiter, checkRateLimit } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Read body for logging (but don't consume it)
  const body = await request
    .clone()
    .json()
    .catch(() => ({}));
  console.log("Login attempt:", { email: body.email, ip });

  const rateLimit = await checkRateLimit(loginRateLimiter, ip);

  if (!rateLimit.success) {
    console.log("Rate limit exceeded for IP:", ip);
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  return handlers.POST(request);
}
