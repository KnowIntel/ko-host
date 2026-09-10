import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd =
  process.env.NODE_ENV ===
  "production";

const nextConfig: NextConfig = {
  reactStrictMode:
    true,

  experimental: {
    serverActions: {
      bodySizeLimit:
        "20mb",
    },
  },

  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
  ],

  outputFileTracingIncludes: {
    "/api/dashboard/microsites/[id]/share-preview/regenerate": [
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
};

export default withPWA({
  dest:
    "public",

  disable:
    !isProd,

  register:
    true,

  skipWaiting:
    true,
})(nextConfig);