// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/clerk";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BodySchema = z.object({
  micrositeId: z.string().uuid(),
});

function mustGetEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const { userId } = await requireAuth();
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { micrositeId } = parsed.data;

  const sb = getSupabaseAdmin();

  // Validate ownership
  const { data: site, error } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, slug, template_key")
    .eq("id", micrositeId)
    .maybeSingle();

  if (error || !site || site.owner_clerk_user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    mustGetEnv("NEXT_PUBLIC_APP_URL");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 1400,
          product_data: {
            name: `${site.template_key} – 90 Days`,
            description: "Temporary microsite access for 90 days.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      microsite_id: site.id,
      template_key: site.template_key,
      clerk_user_id: userId,
    },
    success_url: `${baseUrl}/dashboard/microsites?checkout=success`,
    cancel_url: `${baseUrl}/dashboard/microsites?checkout=cancel`,
  });

  return NextResponse.json({
    ok: true,
    url: session.url,
  });
}