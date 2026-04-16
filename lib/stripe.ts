import Stripe from "stripe";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Stripe SDK already pins an API version internally.
 * Do NOT set apiVersion manually to avoid TS mismatches across SDK versions.
 */
export const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"));

export function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function calcPlatformFee(amount: number) {
  return Math.round(amount * 0.03);
}

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}