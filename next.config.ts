import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Wildcard routing is handled in app/page.tsx + app/[...catchall]/page.tsx

  // Recommended for PWA + caching correctness
  reactStrictMode: true,

  // If you ever ship images from remote domains, configure here:
  // images: { remotePatterns: [{ protocol: "https", hostname: "..." }] },
};

export default withPWA({
  dest: "public",
  disable: !isProd, // don't generate SW in dev
  register: true,
  skipWaiting: true,

  // Helps allow install prompts + offline shell
  // (You can tune runtimeCaching later if needed)
})(nextConfig);