// lib/env.ts
import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(10),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(10),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  RATE_LIMIT_REDIS_DISABLED: z.string().optional()
});

let _env: z.infer<typeof serverSchema> | null = null;

export function env() {
  if (_env) return _env;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  _env = parsed.data;
  return _env;
}