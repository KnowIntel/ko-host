// lib/rateLimit.ts
type Bucket = { count: number; resetAt: number };

const mem = new Map<string, Bucket>();

export function simpleRateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const existing = mem.get(opts.key);

  if (!existing || existing.resetAt <= now) {
    mem.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (existing.count >= opts.limit) {
    return { ok: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  mem.set(opts.key, existing);
  return { ok: true };
}