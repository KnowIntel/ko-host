declare module "next-pwa" {
  import type { NextConfig } from "next";
  type NextPwaOptions = Record<string, unknown>;

  export default function withPWA(options?: NextPwaOptions): (config: NextConfig) => NextConfig;
}