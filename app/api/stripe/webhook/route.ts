import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

function addDaysIsoFrom(baseIso: string | null, days: number) {
  const base = baseIso ? new Date(baseIso) : new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("WEBHOOK ERROR: missing stripe-signature header");
    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret as string);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook signature verification failed";
    console.error("WEBHOOK ERROR: constructEvent failed", message);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  console.log("WEBHOOK RECEIVED EVENT:", event.type, event.id);

  try {
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ ok: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    console.log("WEBHOOK checkout.session.completed metadata:", metadata);

    const ownerClerkUserId = String(metadata.owner_clerk_user_id || "");
    const pendingCheckoutId = String(metadata.pending_checkout_id || "");
    const micrositeId = String(metadata.microsite_id || "");
    const slug = String(metadata.slug || "");
    const title = String(metadata.title || "");
    const templateKey = String(metadata.template_key || "");

    const supabaseAdmin = getSupabaseAdmin();

    if (pendingCheckoutId) {
      console.log("WEBHOOK pending flow start:", {
        pendingCheckoutId,
        ownerClerkUserId,
        slug,
        title,
        templateKey,
      });

      const { data: pendingRow, error: pendingError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .select("*")
        .eq("id", pendingCheckoutId)
        .single();

      console.log("WEBHOOK pending row lookup result:", {
        pendingRow,
        pendingError,
      });

      if (pendingError || !pendingRow) {
        console.error("WEBHOOK ERROR: pending row not found", {
          pendingCheckoutId,
          pendingError,
        });
        return NextResponse.json({ ok: false, error: "Pending row not found" }, { status: 404 });
      }

      const { data: existingMicrosite, error: existingMicrositeError } = await supabaseAdmin
        .from("microsites")
        .select("id, slug, paid_until")
        .eq("slug", pendingRow.slug)
        .maybeSingle();

      console.log("WEBHOOK existing microsite lookup:", {
        existingMicrosite,
        existingMicrositeError,
      });

      if (existingMicrosite) {
        const nextPaidUntil = addDaysIsoFrom(existingMicrosite.paid_until, 90);

        const { data: updatedRows, error: updateError } = await supabaseAdmin
          .from("microsites")
          .update({
            paid_until: nextPaidUntil,
            draft: pendingRow.draft ?? null,
            title: pendingRow.title || title,
            template_key: pendingRow.template_key || templateKey,
            site_visibility: pendingRow.site_visibility || "public",
            private_mode: Boolean(pendingRow.private_mode),
            passcode_hash: pendingRow.passcode_hash || null,
          })
          .eq("id", existingMicrosite.id)
          .select();

        console.log("WEBHOOK existing microsite update result:", {
          updatedRows,
          updateError,
        });

        if (updateError) {
          console.error("WEBHOOK ERROR: failed to extend microsite", updateError);
          return NextResponse.json({ ok: false, error: "Failed to extend microsite" }, { status: 500 });
        }
      } else {
        const insertRow = {
          owner_clerk_user_id: pendingRow.owner_clerk_user_id || ownerClerkUserId,
          template_key: pendingRow.template_key || templateKey,
          slug: pendingRow.slug || slug,
          title: pendingRow.title || title,
          is_published: false,
          paid_until: addDaysIsoFrom(null, 90),
          site_visibility: pendingRow.site_visibility || "public",
          private_mode: Boolean(pendingRow.private_mode),
          passcode_hash: pendingRow.passcode_hash || null,
          draft: pendingRow.draft ?? null,
        };

        console.log("WEBHOOK inserting microsite row:", insertRow);

        const { data: insertedRows, error: insertError } = await supabaseAdmin
          .from("microsites")
          .insert(insertRow)
          .select();

        console.log("WEBHOOK insert result:", {
          insertedRows,
          insertError,
        });

        if (insertError) {
          console.error("WEBHOOK ERROR: failed to create microsite", insertError);
          return NextResponse.json({ ok: false, error: "Failed to create microsite" }, { status: 500 });
        }
      }

      const { data: deletedRows, error: deleteError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .delete()
        .eq("id", pendingCheckoutId)
        .select();

      console.log("WEBHOOK pending delete result:", {
        deletedRows,
        deleteError,
      });

      if (deleteError) {
        console.error("WEBHOOK ERROR: failed to delete pending row", deleteError);
      }

      console.log("WEBHOOK pending flow completed successfully");
      return NextResponse.json({ ok: true });
    }

    if (micrositeId) {
      console.log("WEBHOOK existing microsite extend flow start:", {
        micrositeId,
        ownerClerkUserId,
      });

      const { data: existingMicrosite, error: micrositeError } = await supabaseAdmin
        .from("microsites")
        .select("id, paid_until")
        .eq("id", micrositeId)
        .single();

      console.log("WEBHOOK existing microsite lookup:", {
        existingMicrosite,
        micrositeError,
      });

      if (micrositeError || !existingMicrosite) {
        console.error("WEBHOOK ERROR: microsite not found", {
          micrositeId,
          micrositeError,
        });
        return NextResponse.json({ ok: false, error: "Microsite not found" }, { status: 404 });
      }

      const nextPaidUntil = addDaysIsoFrom(existingMicrosite.paid_until, 90);

      const { data: updatedRows, error: updateError } = await supabaseAdmin
        .from("microsites")
        .update({
          paid_until: nextPaidUntil,
        })
        .eq("id", micrositeId)
        .select();

      console.log("WEBHOOK microsite extend result:", {
        updatedRows,
        updateError,
      });

      if (updateError) {
        console.error("WEBHOOK ERROR: failed to extend microsite", updateError);
        return NextResponse.json({ ok: false, error: "Failed to extend microsite" }, { status: 500 });
      }

      console.log("WEBHOOK existing microsite extend completed successfully");
      return NextResponse.json({ ok: true });
    }

    console.error("WEBHOOK ERROR: missing metadata", metadata);
    return NextResponse.json({ ok: false, error: "Missing checkout metadata" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected webhook error";

    console.error("WEBHOOK FATAL ERROR:", message);

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}