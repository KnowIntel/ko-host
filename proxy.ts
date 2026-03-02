// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Protect ONLY:
 * - /dashboard/*
 * - /api/dashboard/*
 *
 * Allow:
 * - /api/cron/* (CRON_SECRET handles)
 * - public microsites + public APIs
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const a = await auth();

  // If not signed in:
  if (!a.userId) {
    const isApi = req.nextUrl.pathname.startsWith("/api/");
    if (isApi) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // redirect to sign-in, preserving where they were headed
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Signed in -> allow
  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};