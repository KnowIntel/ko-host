// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/", // marketing
  "/templates(.*)",
  "/s(.*)", // public microsite renderer
  "/api/stripe/webhook", // Stripe must POST without auth
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

function getSlugFromHost(host: string | null): string | null {
  if (!host) return null;

  const h = host.toLowerCase().split(":")[0]; // strip port

  // Examples we want to support:
  //   {slug}.ko-host.com
  //   {slug}.ko-host.vercel.app
  //
  // Main domains we do NOT treat as slug:
  //   ko-host.com
  //   ko-host.vercel.app
  //
  // Vercel preview domains like:
  //   ko-host-git-main-....vercel.app (ignore)
  const allowedSuffixes = ["ko-host.com", "ko-host.vercel.app"];

  for (const suffix of allowedSuffixes) {
    if (h === suffix) return null;
    if (h.endsWith("." + suffix)) {
      const slug = h.slice(0, -(suffix.length + 1));
      // slug may include dots if user uses nested subdomains; disallow for now
      if (!slug || slug.includes(".")) return null;
      // basic safety: only allow [a-z0-9-]
      if (!/^[a-z0-9-]{2,40}$/.test(slug)) return null;
      return slug;
    }
  }

  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host");
  const slug = getSlugFromHost(host);

  // If request is to {slug}.ko-host.(com|vercel.app), rewrite to /s/{slug}
  if (slug) {
    const url = req.nextUrl.clone();

    // Rewrite path:
    //   /           -> /s/{slug}
    //   /anything   -> /s/{slug}/anything
    // (We’ll implement the catch-all renderer next.)
    const path = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/s/${slug}${path}`;

    const res = NextResponse.rewrite(url);
    res.headers.set("x-ko-host-slug", slug);
    return res;
  }

  // Normal auth behavior for non-subdomain requests
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};