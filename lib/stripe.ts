// lib/stripe.ts
import Stripe from "stripe";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  // Keep a pinned apiVersion for consistency across environments
  apiVersion: "2024-06-20"
});