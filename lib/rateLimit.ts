// lib/rateLimit.ts
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function rateLimitOrThrow(opts: {
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  const sb = getSupabaseAdmin();

  const now = new Date();
  const resetAt = new Date(now.getTime() + opts.windowSeconds * 1000);

  const { data, error } = await sb
    .from("public_rate_limits")
    .select("key,count,reset_at")
    .eq("key", opts.key)
    .maybeSingle();

  if (error) {
    // Fail-open rather than break public forms if rate limit table hiccups
    console.error("rateLimit read failed", { error, key: opts.key });
    return;
  }

  if (!data) {
    const { error: insErr } = await sb.from("public_rate_limits").insert({
      key: opts.key,
      count: 1,
      reset_at: resetAt.toISOString(),
    });

    if (insErr) console.error("rateLimit insert failed", { insErr, key: opts.key });
    return;
  }

  const currentReset = new Date(data.reset_at);
  if (currentReset <= now) {
    const { error: upErr } = await sb
      .from("public_rate_limits")
      .update({ count: 1, reset_at: resetAt.toISOString() })
      .eq("key", opts.key);

    if (upErr) console.error("rateLimit reset failed", { upErr, key: opts.key });
    return;
  }

  if (data.count >= opts.limit) {
    const secondsLeft = Math.max(1, Math.floor((currentReset.getTime() - now.getTime()) / 1000));
    const err = new Error("Rate limit exceeded");
    (err as any).status = 429;
    (err as any).retryAfter = secondsLeft;
    throw err;
  }

  const { error: incErr } = await sb
    .from("public_rate_limits")
    .update({ count: data.count + 1 })
    .eq("key", opts.key);

  if (incErr) console.error("rateLimit increment failed", { incErr, key: opts.key });
}