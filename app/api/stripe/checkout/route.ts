// app/api/stripe/checkout/route.ts
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

async function parseBody(req: Request): Promise<{ micrositeId?: string }> {
  const contentType = req.headers.get("content-type") || "";

  // Form POST from <form>
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const fd = await req.formData();
    const micrositeId = fd.get("micrositeId");
    return { micrositeId: typeof micrositeId === "string" ? micrositeId : undefined };
  }

  // JSON POST from fetch
  const json = await req.json().catch(() => ({}));
  return { micrositeId: json?.micrositeId };
}

export async function POST(req: Request) {
  let userId: string;
  try {
    const auth = await requireAuth();
    userId = auth.userId;
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = await parseBody(req);
  const parsed = Schema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { micrositeId } = parsed.data;

  const sb = getSupabaseAdmin();

  // Validate ownership
  const { data: site, error } = await sb
    .from("microsites")
    .select("id, owner_clerk_user_id, slug, template_key, title")
    .eq("id", micrositeId)
    .maybeSingle();

  if (error || !site) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (site.owner_clerk_user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const baseUrl = mustGetEnv("NEXT_PUBLIC_APP_URL");

  const displayName = site.title || site.slug;

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
            description: `Ko-Host microsite: ${displayName}`,
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

  // If called by a form submit, redirect directly to Stripe
  const accept = req.headers.get("accept") || "";
  const isBrowserFormPost = accept.includes("text/html");

  if (isBrowserFormPost && session.url) {
    return NextResponse.redirect(session.url, { status: 303 });
  }

  // Otherwise return JSON for programmatic callers
  return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
}