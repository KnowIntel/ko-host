// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * We ONLY protect:
 * - /dashboard/*
 * - /api/dashboard/*
 *
 * We explicitly DO NOT protect:
 * - /api/cron/* (cron auth is handled by CRON_SECRET)
 * - public microsites + forms
 * - marketing pages
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/dashboard(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};