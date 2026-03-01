// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { getClerkSupabaseToken } from "@/lib/clerk";

export function getSupabaseServerAnon() {
  const e = env();
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "ko-host-anon" } }
  });
}

/**
 * RLS-aware client for server usage.
 * This passes Authorization: Bearer <Clerk JWT> so policies using auth.jwt() can work.
 */
export async function getSupabaseServerRls() {
  const e = env();
  const token = await getClerkSupabaseToken();

  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        "X-Client-Info": "ko-host-rls",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  });
}