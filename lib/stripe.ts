// lib/stripe.ts
import Stripe from "stripe";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Use Stripe's typed latest API version from the installed SDK.
// This avoids TS mismatches while still pinning behavior to the SDK version.
const apiVersion = Stripe.apiVersion as Stripe.StripeConfig["apiVersion"];

export const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion
});