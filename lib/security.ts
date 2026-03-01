// lib/security.ts
import { clsx } from "clsx";

export function cn(...inputs: Array<string | undefined | null | false>) {
  return clsx(inputs);
}

/**
 * Conservative slug sanitizer.
 * - lowercases
 * - allows a-z, 0-9, and hyphens
 * - trims hyphens
 */
export function sanitizeSlug(input: string) {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  return s;
}