// lib/clerk.ts
import { auth } from "@clerk/nextjs/server";

/**
 * Returns a JWT where "sub" == Clerk userId.
 * Recommended: configure a Clerk JWT template named "supabase".
 */
export async function getClerkSupabaseToken(): Promise<string | null> {
  const a = await auth();
  if (!a.userId) return null;

  try {
    const token = await a.getToken({ template: "supabase" });
    return token ?? null;
  } catch {
    return null;
  }
}