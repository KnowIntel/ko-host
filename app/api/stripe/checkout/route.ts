import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/clerk";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  micrositeId: z.string().uuid(),
});

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getPriceIdForTemplate(templateKey: string): string {
  const key = (templateKey || "").trim().toLowerCase();

  if (key === "wedding_rsvp" || key === "wedding") return mustGetEnv("STRIPE_PRICE_WEDDING");
  if (key === "party_birthday" || key === "party" || key === "birthday") return mustGetEnv("STRIPE_PRICE_PARTY");
  if (key === "baby" || key === "baby_shower") return mustGetEnv("STRIPE_PRICE_BABY");
  if (key === "reunion" || key === "family_reunion") return mustGetEnv("STRIPE_PRICE_REUNION");
  if (key === "memorial" || key === "tribute" || key === "memorial_tribute") return mustGetEnv("STRIPE_PRICE_MEMORIAL");
  if (key === "property" || key === "property_listing") return mustGetEnv("STRIPE_PRICE_PROPERTY");
  if (key === "open_house" || key === "openhouse") return mustGetEnv("STRIPE_PRICE_OPENHOUSE");
  if (key === "launch" || key === "product_launch") return mustGetEnv("STRIPE_PRICE_LAUNCH");
  if (key === "crowd" || key === "crowdfunding" || key === "crowdfunding_campaign") return mustGetEnv("STRIPE_PRICE_CROWD");
  if (key === "resume" || key === "portfolio" || key === "resume_portfolio")
    return mustGetEnv("STRIPE_PRICE_RESUME");

  throw new Error(`No Stripe price env mapped for template_key: ${templateKey}`);
}

async function parseBody(req: Request): Promise<{ micrositeId?: string }> {
  const contentType = req.headers.get("content-type") || "";

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const fd = await req.formData();
    const micrositeId = fd.get("micrositeId");
    return { micrositeId: typeof micrositeId === "string" ? micrositeId : undefined };
  }

  const json = await req.json().catch(() => ({}));
  return { micrositeId: json?.micrositeId };
}

async function handleCheckout(micrositeId: string, req: Request) {
  let userId: string;
  try {
    const auth = await requireAuth();
    userId = auth.userId;
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();

  const { data: site, error } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, slug, template_key, title")
    .eq("id", micrositeId)
    .maybeSingle();

  if (error || !site) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (site.owner_clerk_user_id !== userId) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const baseUrl = mustGetEnv("NEXT_PUBLIC_APP_URL");

  let priceId: string;
  try {
    priceId = getPriceIdForTemplate(site.template_key);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Template not priced" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      microsite_id: site.id,
      template_key: site.template_key,
      clerk_user_id: userId,
    },
    success_url: `${baseUrl}/dashboard/microsites?checkout=success&micrositeId=${site.id}`,
    cancel_url: `${baseUrl}/dashboard/microsites?checkout=cancel&micrositeId=${site.id}`,
  });

  // If browser hit this endpoint, redirect.
  if (session.url) {
    return NextResponse.redirect(session.url, { status: 303 });
  }

  return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const micrositeId = searchParams.get("micrositeId") || "";
  const parsed = Schema.safeParse({ micrositeId });
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  return handleCheckout(parsed.data.micrositeId, req);
}

export async function POST(req: Request) {
  const raw = await parseBody(req);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  return handleCheckout(parsed.data.micrositeId, req);
}