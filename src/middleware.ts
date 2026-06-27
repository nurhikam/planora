import type { NextRequest } from "next/server";

// Simple cookie-based auth check for protected routes
// Note: This only checks if session cookie exists. Actual token validation
// happens in API routes via auth() call, which verifies JWT signature & expiry.
export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) {
    return Response.redirect(new URL("/login", request.url), 307);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/tasks/:path*", "/api/ai/:path*"],
};
