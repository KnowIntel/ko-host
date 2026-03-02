// middleware.ts
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * NOTE: Next.js 16 deprecates middleware.ts in favor of proxy.ts,
 * but if this file exists it can still run and intercept requests.
 *
 * We must ensure /api/cron/* is NOT protected by Clerk,
 * because cron auth is handled by CRON_SECRET inside the route handler.
 */

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect dashboard + api/dashboard
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const a = await auth();

  if (!a.userId) {
    const isApi = req.nextUrl.pathname.startsWith("/api/");
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
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};