import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",                 // landing
  "/s(.*)",            // public microsites
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/public(.*)",   // public APIs (rsvp, poll, gallery list)
  "/api/stripe/webhook", // stripe webhook must be reachable
  "/api/cron(.*)",     // cron reachable via CRON_SECRET
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;

  // Protect everything else (dashboard + dashboard APIs)
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals + static
    "/((?!_next|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|webp|ico|txt|map)$).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
};