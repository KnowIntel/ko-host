// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getRootHost(hostname: string) {
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.startsWith("127.0.0.1") ||
    hostname.startsWith("0.0.0.0")
  ) {
    return "localhost";
  }

  const parts = hostname.split(".");
  if (parts.length >= 2) {
    return parts.slice(-2).join(".");
  }

  return hostname;
}

function getSubdomain(hostname: string) {
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.startsWith("127.0.0.1") ||
    hostname.startsWith("0.0.0.0")
  ) {
    const localhostParts = hostname.split(".");
    if (localhostParts.length > 1) {
      return localhostParts[0];
    }
    return "";
  }

  const parts = hostname.split(".");
  if (parts.length <= 2) return "";
  return parts.slice(0, -2).join(".");
}

function shouldBypassSubdomain(subdomain: string) {
  if (!subdomain) return true;

  const blocked = new Set(["www", "app", "api", "admin", "dashboard"]);
  return blocked.has(subdomain.toLowerCase());
}

export default clerkMiddleware(async (_auth, req: NextRequest) => {
  const url = req.nextUrl;
  const pathname = url.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hostHeader = req.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0]?.toLowerCase() || "";

  if (!hostname) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);
  const rootHost = getRootHost(hostname);

  if (shouldBypassSubdomain(subdomain)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  if (
    rootHost === "ko-host.com" ||
    rootHost === "localhost" ||
    rootHost === "ko-host.local"
  ) {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/s/${subdomain}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};