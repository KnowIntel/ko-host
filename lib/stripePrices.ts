// lib/stripePrices.ts

/**
 * These keys MUST match templates.template_key in Supabase.
 * Update keys here if your DB uses different ones.
 */
export type TemplateKey =
  | "wedding_rsvp"
  | "party_birthday"
  | "baby_shower"
  | "family_reunion"
  | "memorial_tribute"
  | "property_listing"
  | "open_house"
  | "product_launch"
  | "crowdfunding_campaign"
  | "resume_portfolio";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function getPriceIdForTemplate(templateKey: string): string | null {
  // Keep runtime tolerant (string in), but only allow known keys
  const key = templateKey as TemplateKey;

  switch (key) {
    case "wedding_rsvp":
      return mustGetEnv("STRIPE_PRICE_WEDDING");
    case "party_birthday":
      return mustGetEnv("STRIPE_PRICE_PARTY");
    case "baby_shower":
      return mustGetEnv("STRIPE_PRICE_BABY");
    case "family_reunion":
      return mustGetEnv("STRIPE_PRICE_REUNION");
    case "memorial_tribute":
      return mustGetEnv("STRIPE_PRICE_MEMORIAL");
    case "property_listing":
      return mustGetEnv("STRIPE_PRICE_PROPERTY");
    case "open_house":
      return mustGetEnv("STRIPE_PRICE_OPENHOUSE");
    case "product_launch":
      return mustGetEnv("STRIPE_PRICE_LAUNCH");
    case "crowdfunding_campaign":
      return mustGetEnv("STRIPE_PRICE_CROWD");
    case "resume_portfolio":
      return mustGetEnv("STRIPE_PRICE_RESUME");
    default:
      return null;
  }
}