// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Server-side Supabase client using the ANON key.
 *
 * Notes:
 * - Use this ONLY when you specifically want an anon client on the server.
 * - For privileged operations (webhooks, ownership checks, exports), use getSupabaseAdmin().
 */
export function getSupabaseServerAnon() {
  return createClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false },
    }
  );
}