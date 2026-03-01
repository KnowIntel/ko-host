// lib/stripe.ts
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