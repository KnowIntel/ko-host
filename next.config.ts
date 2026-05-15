import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default withPWA({
  dest: "public",
  disable: !isProd, // don't generate SW in dev
  register: true,
  skipWaiting: true,

  // Helps allow install prompts + offline shell
  // (You can tune runtimeCaching later if needed)
})(nextConfig);