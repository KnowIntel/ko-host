// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 middleware entrypoint.
 *
 * We protect ONLY:
 * - /dashboard/*
 * - /api/dashboard/*
 *
 * We explicitly DO NOT protect:
 * - /api/cron/* (cron auth handled by CRON_SECRET inside the route handler)
 * - public microsites (/s/* and subdomains)
 * - public submission APIs
 */
function isProtectedPath(pathname: string) {
  return pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/api/dashboard" ||
    pathname.startsWith("/api/dashboard/");
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const a = await auth();

  if (!a.userId) {
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
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};