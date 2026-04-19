// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateMicrositeThumbnail } from "@/lib/screenshotMicrosite";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!webhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

if (!appUrl) {
  throw new Error("Missing NEXT_PUBLIC_APP_URL");
}

const verifiedStripeSecretKey: string = stripeSecretKey;
const verifiedWebhookSecret: string = webhookSecret;
const verifiedAppUrl: string = appUrl;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const stripe = new Stripe(verifiedStripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

function addDaysIsoFrom(baseIso: string | null, days: number) {
  const base = baseIso ? new Date(baseIso) : new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function makeReceiptNumber(nowIso: string, sessionId: string) {
  const d = new Date(nowIso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const tail = sessionId.slice(-6).toUpperCase();
  return `R-${yyyy}${mm}${dd}-${tail}`;
}

function makeOrderId(sessionId: string) {
  return `ord_${sessionId.slice(-12)}`;
}

export async function POST(req: Request) {
  try {
    console.log("WEBHOOK ROUTE HIT");

    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("STRIPE WEBHOOK ERROR: Missing stripe-signature header");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let event: Stripe.Event;

    console.log("WEBHOOK SECRET DEBUG", {
      hasSecret: !!verifiedWebhookSecret,
      secretPrefix: verifiedWebhookSecret.slice(0, 12),
      secretLength: verifiedWebhookSecret.length,
    });

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        verifiedWebhookSecret,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Webhook verification failed";

      console.error("STRIPE WEBHOOK VERIFY ERROR:", message);
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    console.log("=== WEBHOOK RECEIVED ===");
    console.log("event.type:", event.type);

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ ok: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    console.log("=== SESSION DATA ===", {
      sessionId: session.id,
      metadata,
      client_reference_id: session.client_reference_id,
    });

    const flow = String(metadata.flow || "");
    const pendingCheckoutId = String(
      metadata.pendingCheckoutId || metadata.pending_checkout_id || "",
    );
    const micrositeIdFromMetadata = String(
      metadata.micrositeId || metadata.microsite_id || "",
    );
    const designKeyFromMetadata = String(
      metadata.designKey || metadata.design_key || "",
    );

    console.log("STRIPE WEBHOOK checkout.session.completed", {
      sessionId: session.id,
      flow,
      pendingCheckoutId,
      micrositeIdFromMetadata,
      metadata,
    });

    const supabaseAdmin = getSupabaseAdmin();

    // ============================================================
    // CART FLOW
    // ============================================================
    if (flow === "cart") {
      const { data: cartRow, error: cartLookupError } = await supabaseAdmin
        .from("cart_checkouts")
        .select("*")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (cartLookupError) {
        console.error(
          "STRIPE WEBHOOK ERROR: Cart checkout lookup failed",
          cartLookupError,
        );
        return NextResponse.json(
          { ok: false, error: "Cart checkout lookup failed" },
          { status: 500 },
        );
      }

      if (!cartRow) {
        console.error("STRIPE WEBHOOK ERROR: Cart checkout not found", {
          sessionId: session.id,
        });
        return NextResponse.json({ ok: true });
      }

      if (cartRow.payment_status === "paid") {
        return NextResponse.json({ ok: true, alreadyProcessed: true });
      }

      const nowIso = new Date().toISOString();
      const buyerEmail = String(session.customer_details?.email || "");
      const buyerName = String(session.customer_details?.name || "");
      const orderId =
        typeof cartRow.order_id === "string" && cartRow.order_id
          ? cartRow.order_id
          : makeOrderId(session.id);
      const receiptNumber =
        typeof cartRow.receipt_number === "string" && cartRow.receipt_number
          ? cartRow.receipt_number
          : makeReceiptNumber(nowIso, session.id);
      const receiptToken =
        typeof cartRow.receipt_token === "string" && cartRow.receipt_token
          ? cartRow.receipt_token
          : randomUUID();

      const { error: cartUpdateError } = await supabaseAdmin
        .from("cart_checkouts")
        .update({
          payment_status: "paid",
          completed_at: nowIso,
          buyer_email: buyerEmail || null,
          buyer_name: buyerName || null,
          order_id: orderId,
          receipt_number: receiptNumber,
          receipt_token: receiptToken,
        })
        .eq("stripe_session_id", session.id);

      if (cartUpdateError) {
        console.error(
          "STRIPE WEBHOOK ERROR: Cart checkout update failed",
          cartUpdateError,
        );
        return NextResponse.json(
          { ok: false, error: "Failed to mark cart checkout paid" },
          { status: 500 },
        );
      }

      try {
        const items = Array.isArray(cartRow.cart_items) ? cartRow.cart_items : [];

        const { data: microsite, error: micrositeLookupError } =
          await supabaseAdmin
            .from("microsites")
            .select("title, homepage_thumbnail_url, owner_clerk_user_id")
            .eq("slug", cartRow.slug)
            .maybeSingle();

        if (micrositeLookupError) {
          console.error("EMAIL BRANDING LOOKUP FAILED", micrositeLookupError);
        }

        const siteTitle = microsite?.title || cartRow.slug || "Ko-Host Site";
        const siteImage = microsite?.homepage_thumbnail_url || "";
        const ownerId = microsite?.owner_clerk_user_id || "";

        let ownerEmail: string | null = null;

        try {
          if (ownerId && process.env.CLERK_SECRET_KEY) {
            const clerkRes = await fetch(
              `https://api.clerk.com/v1/users/${ownerId}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                },
              },
            );

            if (clerkRes.ok) {
              const clerkData = await clerkRes.json();
              ownerEmail =
                clerkData?.email_addresses?.[0]?.email_address || null;
            } else {
              console.error("OWNER EMAIL FETCH FAILED", {
                status: clerkRes.status,
                ownerId,
              });
            }
          }
        } catch (err) {
          console.error("OWNER EMAIL FETCH FAILED", err);
        }

        const receiptUrl = `${verifiedAppUrl}/api/receipts/${encodeURIComponent(
          orderId,
        )}?token=${encodeURIComponent(receiptToken)}`;

        const purchasedAt = new Date(nowIso).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        });

        const buildEmailHtml = (headingText: string) => `
<div style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
    <div style="background:#000;color:#fff;padding:16px 20px;">
      <div style="font-size:18px;font-weight:bold;">
        ${siteTitle}
      </div>
      <div style="font-size:12px;opacity:0.7;">
        Powered by Ko-Host
      </div>
    </div>

    ${siteImage ? `
    <img src="${siteImage}" style="width:100%;height:auto;display:block;" />
    ` : ""}

    <div style="padding:20px;">
      <p style="margin:0 0 16px 0;font-size:14px;">
        ${headingText}
      </p>

      <div style="background:#f6f6f6;border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;">
        <div style="margin-bottom:6px;"><strong>Order ID:</strong> ${orderId}</div>
        <div style="margin-bottom:6px;"><strong>Receipt #:</strong> ${receiptNumber}</div>
        <div><strong>Purchased:</strong> ${purchasedAt}</div>
      </div>

      <div style="margin-bottom:20px;">
        ${items
          .map((item: any) => {
            const name = item?.name || "Item";
            const qty = Number(item?.quantity || 1);
            const lineTotal = Number(item?.price || 0) * qty;

            return `
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
                <span>${name} × ${qty}</span>
                <span>$${formatCurrency(lineTotal)}</span>
              </div>
            `;
          })
          .join("")}
      </div>

<div style="border-top:1px solid #eee;padding-top:12px;font-size:14px;">
  <div style="display:flex;justify-content:space-between;">
    <span>Subtotal&nbsp;</span>
    <span>$${formatCurrency(Number(cartRow.subtotal || 0))}</span>
  </div>

  <div style="display:flex;justify-content:space-between;">
    <span>Tax&nbsp;</span>
    <span>$${formatCurrency(Number(cartRow.tax || 0))}</span>
  </div>

  <div style="display:flex;justify-content:space-between;">
    <span>Discount&nbsp;</span>
    <span>- $${formatCurrency(Number(cartRow.discount || 0))}</span>
  </div>

  <div style="display:flex;justify-content:space-between;font-weight:bold;margin-top:8px;">
    <span>Total&nbsp;</span>
    <span>$${formatCurrency(Number(cartRow.total || 0))}</span>
  </div>
</div>

      <div style="margin-top:20px;">
        <a
          href="${receiptUrl}"
          style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:14px;"
        >
          Download Receipt PDF
        </a>
      </div>

      <p style="margin-top:20px;font-size:12px;color:#666;">
        Powered by Ko-Host
      </p>
    </div>
  </div>
</div>
`;

        const buyerEmailHtml = buildEmailHtml("Thank you for your purchase!");
        const ownerEmailHtml = buildEmailHtml("You’ve received a new order");

        if (process.env.RESEND_API_KEY && buyerEmail) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${siteTitle} <no-reply@ko-host.com>`,
              to: buyerEmail,
              subject: `${siteTitle} — Purchase Confirmation`,
              html: buyerEmailHtml,
            }),
          });
        }

        if (process.env.RESEND_API_KEY && ownerEmail) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Ko-Host <no-reply@ko-host.com>",
              to: ownerEmail,
              subject: `New Purchase on ${siteTitle}`,
              html: ownerEmailHtml,
            }),
          });
        }
      } catch (err) {
        console.error("EMAIL SEND FAILED", err);
      }

      return NextResponse.json({ ok: true });
    }

        // ============================================================
    // DONATION FLOW
    // ============================================================
    if (flow === "donation") {
      const micrositeId = String(metadata.micrositeId || metadata.microsite_id || "");
      const donationLabel = String(metadata.donationLabel || "Donation");
      const donationAmount = Number(metadata.donationAmount || 0);
      const buyerEmail = String(session.customer_details?.email || "");
      const buyerName = String(session.customer_details?.name || "");
      const nowIso = new Date().toISOString();

      if (!micrositeId) {
        console.error("STRIPE WEBHOOK ERROR: Missing donation micrositeId", {
          sessionId: session.id,
          metadata,
        });
        return NextResponse.json(
          { ok: false, error: "Missing donation micrositeId" },
          { status: 400 },
        );
      }

      const { data: microsite, error: micrositeLookupError } = await supabaseAdmin
        .from("microsites")
        .select("id, slug, title, homepage_thumbnail_url, owner_clerk_user_id")
        .eq("id", micrositeId)
        .maybeSingle();

      if (micrositeLookupError || !microsite) {
        console.error(
          "STRIPE WEBHOOK ERROR: Donation microsite lookup failed",
          micrositeLookupError,
        );
        return NextResponse.json(
          { ok: false, error: "Donation microsite not found" },
          { status: 404 },
        );
      }

      let ownerEmail: string | null = null;

      try {
        const ownerId = microsite.owner_clerk_user_id || "";

        if (ownerId && process.env.CLERK_SECRET_KEY) {
          const clerkRes = await fetch(
            `https://api.clerk.com/v1/users/${ownerId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              },
            },
          );

          if (clerkRes.ok) {
            const clerkData = await clerkRes.json();
            ownerEmail =
              clerkData?.email_addresses?.[0]?.email_address || null;
          } else {
            console.error("OWNER EMAIL FETCH FAILED", {
              status: clerkRes.status,
              ownerId,
            });
          }
        }
      } catch (err) {
        console.error("OWNER EMAIL FETCH FAILED", err);
      }

      try {
        const siteTitle = microsite.title || microsite.slug || "Ko-Host Site";
        const siteImage = microsite.homepage_thumbnail_url || "";
        const donatedAt = new Date(nowIso).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        });

        const buildDonationEmailHtml = (headingText: string) => `
<div style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
    <div style="background:#000;color:#fff;padding:16px 20px;">
      <div style="font-size:18px;font-weight:bold;">
        ${siteTitle}
      </div>
      <div style="font-size:12px;opacity:0.7;">
        Powered by Ko-Host
      </div>
    </div>

    ${siteImage ? `
    <img src="${siteImage}" style="width:100%;height:auto;display:block;" />
    ` : ""}

    <div style="padding:20px;">
      <p style="margin:0 0 16px 0;font-size:14px;">
        ${headingText}
      </p>

      <div style="background:#f6f6f6;border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;">
        <div style="margin-bottom:6px;"><strong>Donation Type:</strong> ${donationLabel}</div>
        <div style="margin-bottom:6px;"><strong>Amount:</strong> $${formatCurrency(donationAmount)}</div>
        <div><strong>Date:</strong> ${donatedAt}</div>
      </div>

      <p style="margin-top:20px;font-size:12px;color:#666;">
        Powered by Ko-Host
      </p>
    </div>
  </div>
</div>
`;

        const buyerEmailHtml = buildDonationEmailHtml("Thank you for your donation!");
        const ownerEmailHtml = buildDonationEmailHtml("You’ve received a new donation");

        if (process.env.RESEND_API_KEY && buyerEmail) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${siteTitle} <no-reply@ko-host.com>`,
              to: buyerEmail,
              subject: `${siteTitle} — Donation Confirmation`,
              html: buyerEmailHtml,
            }),
          });
        }

        if (process.env.RESEND_API_KEY && ownerEmail) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Ko-Host <no-reply@ko-host.com>",
              to: ownerEmail,
              subject: `New Donation on ${siteTitle}`,
              html: ownerEmailHtml,
            }),
          });
        }
      } catch (err) {
        console.error("DONATION EMAIL SEND FAILED", err);
      }

      return NextResponse.json({ ok: true });
    }

    // ============================================================
    // PENDING CHECKOUT FLOW (PUBLISH NEW MICROSITE)
    // ============================================================
    if (pendingCheckoutId) {
      const { data: pendingRow, error: pendingError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .select("*")
        .eq("id", pendingCheckoutId)
        .maybeSingle();

      console.log("=== PENDING LOOKUP RESULT ===", {
        pendingCheckoutId,
        found: !!pendingRow,
        pendingError,
      });

      if (pendingError) {
        console.error(
          "STRIPE WEBHOOK ERROR: Pending row lookup failed",
          pendingError,
        );
        return NextResponse.json(
          { ok: false, error: "Pending checkout lookup failed" },
          { status: 500 },
        );
      }

      if (!pendingRow) {
        console.error("STRIPE WEBHOOK ERROR: Pending checkout not found", {
          pendingCheckoutId,
        });
        return NextResponse.json(
          { ok: false, error: "Pending checkout not found" },
          { status: 404 },
        );
      }

      if (pendingRow.processed_at) {
        return NextResponse.json({ ok: true, alreadyProcessed: true });
      }

      if (
        pendingRow.stripe_session_id &&
        pendingRow.stripe_session_id !== session.id
      ) {
        console.error("STRIPE WEBHOOK ERROR: Session mismatch", {
          expected: pendingRow.stripe_session_id,
          received: session.id,
          pendingCheckoutId,
        });

        return NextResponse.json(
          { ok: false, error: "Session mismatch" },
          { status: 400 },
        );
      }

      const ownerClerkUserId =
        typeof pendingRow.owner_clerk_user_id === "string"
          ? pendingRow.owner_clerk_user_id
          : "";
      const templateKey =
        typeof pendingRow.template_key === "string"
          ? pendingRow.template_key
          : "";
      const title =
        typeof pendingRow.title === "string" ? pendingRow.title : "";
      const slug =
        typeof pendingRow.slug === "string" ? pendingRow.slug : "";
      const siteVisibility =
        typeof pendingRow.site_visibility === "string"
          ? pendingRow.site_visibility
          : "public";
      const privateMode =
        typeof pendingRow.private_mode === "string"
          ? pendingRow.private_mode
          : "passcode";
      const passcodeHash =
        typeof pendingRow.passcode_hash === "string"
          ? pendingRow.passcode_hash
          : null;
      const broadcastOnHomepage = Boolean(pendingRow.broadcast_on_homepage);
      const selectedDesignKey =
        typeof pendingRow.selected_design_key === "string"
          ? pendingRow.selected_design_key
          : "";

      if (!ownerClerkUserId) {
        return NextResponse.json(
          { ok: false, error: "Missing owner_clerk_user_id" },
          { status: 400 },
        );
      }

      if (!templateKey) {
        return NextResponse.json(
          { ok: false, error: "Missing template_key" },
          { status: 400 },
        );
      }

      if (!slug) {
        return NextResponse.json(
          { ok: false, error: "Missing slug" },
          { status: 400 },
        );
      }

      const resolvedDesignKey =
        selectedDesignKey || designKeyFromMetadata || "blank";

      console.log("=== PENDING ROW CORE DATA ===", {
        slug,
        ownerClerkUserId,
        templateKey,
        resolvedDesignKey,
        hasDraft: !!pendingRow.draft,
      });

      const { data: conflictingMicrosite, error: conflictingMicrositeError } =
        await supabaseAdmin
          .from("microsites")
          .select("id, owner_clerk_user_id")
          .eq("slug", slug)
          .maybeSingle();

      if (conflictingMicrositeError) {
        console.error(
          "STRIPE WEBHOOK ERROR: slug conflict lookup failed",
          conflictingMicrositeError,
        );
        return NextResponse.json(
          { ok: false, error: conflictingMicrositeError.message },
          { status: 500 },
        );
      }

      if (
        conflictingMicrosite &&
        conflictingMicrosite.owner_clerk_user_id !== ownerClerkUserId
      ) {
        console.error("STRIPE WEBHOOK ERROR: Slug conflict detected", { slug });
        return NextResponse.json(
          { ok: false, error: "Slug already taken" },
          { status: 409 },
        );
      }

      const nowIso = new Date().toISOString();

      const micrositePayload = {
        owner_clerk_user_id: ownerClerkUserId,
        template_key: templateKey,
        slug,
        title,
        status: "published",
        is_active: true,
        is_published: true,
        published_at: nowIso,
        paid_until: addDaysIsoFrom(null, 90),
        site_visibility: siteVisibility,
        broadcast_on_homepage: broadcastOnHomepage,
        private_mode: privateMode,
        passcode_hash: passcodeHash,
        draft: pendingRow.draft ?? null,
        selected_design_key: resolvedDesignKey,
        updated_at: nowIso,
      };

      console.log("=== MICROSITE PAYLOAD ===", micrositePayload);

      let publishedMicrositeId = "";

      if (!conflictingMicrosite) {
        const { data: insertedMicrosite, error: insertMicrositeError } =
          await supabaseAdmin
            .from("microsites")
            .insert({
              ...micrositePayload,
              created_at: nowIso,
            })
            .select("id, slug, owner_clerk_user_id")
            .single();

        console.log("=== INSERT RESULT ===", {
          insertedMicrosite,
          insertMicrositeError,
        });

        if (insertMicrositeError || !insertedMicrosite) {
          console.error("STRIPE WEBHOOK ERROR: microsite insert failed", {
            error: insertMicrositeError,
            payload: micrositePayload,
          });

          return NextResponse.json(
            {
              ok: false,
              error:
                insertMicrositeError?.message || "Failed to create microsite",
            },
            { status: 500 },
          );
        }

        publishedMicrositeId = insertedMicrosite.id;
      } else {
        const { data: updatedMicrosite, error: updateMicrositeError } =
          await supabaseAdmin
            .from("microsites")
            .update({
              ...micrositePayload,
            })
            .eq("id", conflictingMicrosite.id)
            .eq("owner_clerk_user_id", ownerClerkUserId)
            .select("id, slug, owner_clerk_user_id")
            .single();

        console.log("=== UPDATE RESULT ===", {
          updatedMicrosite,
          updateMicrositeError,
        });

        if (updateMicrositeError || !updatedMicrosite) {
          console.error("STRIPE WEBHOOK ERROR: microsite update failed", {
            error: updateMicrositeError,
            micrositeId: conflictingMicrosite.id,
            payload: micrositePayload,
          });

          return NextResponse.json(
            {
              ok: false,
              error:
                updateMicrositeError?.message || "Failed to update microsite",
            },
            { status: 500 },
          );
        }

        publishedMicrositeId = updatedMicrosite.id;
      }

      const publishedDraft =
        pendingRow.draft && typeof pendingRow.draft === "object"
          ? {
              ...pendingRow.draft,
              broadcastOnHomepage,
            }
          : null;

      if (!publishedDraft) {
        return NextResponse.json(
          {
            ok: false,
            error: "Pending checkout is missing published draft data.",
          },
          { status: 500 },
        );
      }

      const { data: existingHomePage, error: existingHomePageError } =
        await supabaseAdmin
          .from("microsite_pages")
          .select("id")
          .eq("microsite_id", publishedMicrositeId)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (existingHomePageError) {
        console.error(
          "STRIPE WEBHOOK ERROR: microsite page lookup failed",
          existingHomePageError,
        );

        return NextResponse.json(
          { ok: false, error: existingHomePageError.message },
          { status: 500 },
        );
      }

      if (!existingHomePage) {
        const { error: insertHomePageError } = await supabaseAdmin
          .from("microsite_pages")
          .insert({
            microsite_id: publishedMicrositeId,
            slug: "home",
            title: title || "Home",
            draft: publishedDraft,
            display_order: 0,
            is_homepage: true,
            created_at: nowIso,
            updated_at: nowIso,
          });

        if (insertHomePageError) {
          console.error(
            "STRIPE WEBHOOK ERROR: microsite page insert failed",
            insertHomePageError,
          );

          return NextResponse.json(
            { ok: false, error: insertHomePageError.message },
            { status: 500 },
          );
        }
      } else {
        const { error: updateHomePageError } = await supabaseAdmin
          .from("microsite_pages")
          .update({
            title: title || "Home",
            draft: publishedDraft,
            is_homepage: true,
            updated_at: nowIso,
          })
          .eq("id", existingHomePage.id);

        if (updateHomePageError) {
          console.error(
            "STRIPE WEBHOOK ERROR: microsite page update failed",
            updateHomePageError,
          );

          return NextResponse.json(
            { ok: false, error: updateHomePageError.message },
            { status: 500 },
          );
        }
      }

      const { error: processedError } = await supabaseAdmin
        .from("pending_microsite_checkouts")
        .update({
          stripe_session_id: session.id,
          processed_at: nowIso,
        })
        .eq("id", pendingCheckoutId)
        .is("processed_at", null);

      if (processedError) {
        console.error(
          "STRIPE WEBHOOK ERROR: pending checkout processed mark failed",
          processedError,
        );
        return NextResponse.json(
          { ok: false, error: processedError.message },
          { status: 500 },
        );
      }

      const exactDraftDesignKey =
        resolvedDesignKey && resolvedDesignKey.trim().length > 0
          ? resolvedDesignKey
          : "blank";

      const { error: deleteDraftError } = await supabaseAdmin
        .from("microsite_drafts")
        .delete()
        .eq("owner_clerk_user_id", ownerClerkUserId)
        .eq("template_key", templateKey)
        .eq("design_key", exactDraftDesignKey);

      if (deleteDraftError) {
        console.error(
          "STRIPE WEBHOOK WARNING: draft delete failed",
          deleteDraftError,
        );
      }

      try {
        const snapshotUrl = `https://${slug}.ko-host.com`;
        const buffer = await generateMicrositeThumbnail(snapshotUrl);
        const filePath = `${slug}.jpg`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from("microsite-thumbnails")
          .upload(filePath, buffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("Thumbnail upload failed:", uploadError);
        } else {
          const { data } = supabaseAdmin.storage
            .from("microsite-thumbnails")
            .getPublicUrl(filePath);

          const { error: thumbnailUpdateError } = await supabaseAdmin
            .from("microsites")
            .update({
              homepage_thumbnail_url: data.publicUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", publishedMicrositeId);

          if (thumbnailUpdateError) {
            console.error(
              "Homepage thumbnail db update failed:",
              thumbnailUpdateError,
            );
          } else {
            console.log("✅ Homepage thumbnail saved:", data.publicUrl);
          }
        }
      } catch (err) {
        console.error("Thumbnail generation failed:", err);
      }

      console.log("STRIPE WEBHOOK SUCCESS:", {
        flow: "pending_checkout_publish",
        micrositeId: publishedMicrositeId,
        slug,
        title,
        stripeSessionId: session.id,
        pendingCheckoutId,
        broadcastOnHomepage,
      });

      return NextResponse.json({ ok: true });
    }

    // ============================================================
    // EXISTING MICROSITE FLOW (RENEW / ACTIVATE EXISTING LIVE SITE)
    // ============================================================
    if (micrositeIdFromMetadata) {
      const { data: micrositeRow, error: micrositeError } = await supabaseAdmin
        .from("microsites")
        .select("id, owner_clerk_user_id, slug, title, paid_until")
        .eq("id", micrositeIdFromMetadata)
        .single();

      if (micrositeError || !micrositeRow) {
        console.error(
          "STRIPE WEBHOOK ERROR: Existing microsite lookup failed",
          micrositeError,
        );
        return NextResponse.json(
          { ok: false, error: "Microsite not found" },
          { status: 404 },
        );
      }

      const nextPaidUntil = addDaysIsoFrom(
        typeof micrositeRow.paid_until === "string"
          ? micrositeRow.paid_until
          : null,
        90,
      );

      const { error: updateExistingMicrositeError } = await supabaseAdmin
        .from("microsites")
        .update({
          status: "published",
          is_active: true,
          is_published: true,
          paid_until: nextPaidUntil,
          updated_at: new Date().toISOString(),
        })
        .eq("id", micrositeRow.id);

      if (updateExistingMicrositeError) {
        console.error(
          "STRIPE WEBHOOK ERROR: Existing microsite update failed",
          updateExistingMicrositeError,
        );
        return NextResponse.json(
          { ok: false, error: updateExistingMicrositeError.message },
          { status: 500 },
        );
      }

      console.log("STRIPE WEBHOOK SUCCESS:", {
        flow: "existing_microsite_publish",
        micrositeId: micrositeRow.id,
        slug: micrositeRow.slug,
        title: micrositeRow.title,
        stripeSessionId: session.id,
      });

      return NextResponse.json({ ok: true });
    }

    console.error("STRIPE WEBHOOK ERROR: Missing publish identifiers", {
      sessionId: session.id,
      metadata,
    });

    return NextResponse.json(
      { ok: false, error: "Missing publish identifiers" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    console.error("STRIPE WEBHOOK FATAL ERROR:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}