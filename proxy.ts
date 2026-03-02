// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * IMPORTANT:
 * We only run Clerk middleware on protected routes via `config.matcher`.
 * That guarantees routes like /api/cron/* are never intercepted by Clerk.
 */

export default clerkMiddleware(async (auth, req) => {
  const a = await auth();

  if (!a.userId) {
    const pathname = req.nextUrl.pathname;
    const isApi = pathname.startsWith("/api/");

    if (isApi) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // ✅ ONLY protect dashboard + api/dashboard. Nothing else.
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};