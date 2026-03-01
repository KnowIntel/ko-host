// lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Service-role Supabase client. Use ONLY in server code (route handlers, server actions).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");

  _admin = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return _admin;
}