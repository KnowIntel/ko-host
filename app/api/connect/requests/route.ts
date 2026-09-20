// app/api/connect/requests/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "connect-request-images";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ZIP_CODE_PATTERN = /^\d{5}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAILBOX_CODE_LENGTH = 10;
const MAILBOX_CODE_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function safeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function createRequestCode() {
  return crypto.randomBytes(8).toString("hex");
}

function createMailboxCode() {
  let code = "";

  for (let index = 0; index < MAILBOX_CODE_LENGTH; index += 1) {
    const randomIndex = crypto.randomInt(
      0,
      MAILBOX_CODE_CHARACTERS.length,
    );

    code += MAILBOX_CODE_CHARACTERS[randomIndex];
  }

  return code;
}

function createMailboxPin() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashMailboxPin(pin: string) {
  return crypto
    .createHash("sha256")
    .update(pin, "utf8")
    .digest("hex");
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
}

async function removeUploadedFiles(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  paths: string[],
) {
  if (paths.length === 0) return;

  await supabase.storage.from(BUCKET).remove(paths);
}

async function removeCreatedRequest(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  requestId: string,
  uploadedPaths: string[],
) {
  await removeUploadedFiles(supabase, uploadedPaths);

  /*
   * Child records cascade automatically:
   *
   * connect_request_photos
   * connect_mailboxes
   * connect_request_matches
   */
  await supabase
    .from("connect_requests")
    .delete()
    .eq("id", requestId);
}

export async function POST(request: NextRequest) {
  const uploadedPaths: string[] = [];

  try {
    const formData = await request.formData();

    const service = String(
      formData.get("service") ?? "",
    ).trim();

    const zipCode = String(
      formData.get("zipCode") ?? "",
    ).trim();

    const serviceNeededDate = String(
      formData.get("serviceNeededDate") ?? "",
    ).trim();

    const details = String(
      formData.get("details") ?? "",
    ).trim();

    const notificationEmail = String(
      formData.get("notificationEmail") ?? "",
    ).trim();

    const images = formData
      .getAll("images")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0,
      );

    // =====================================================
    // Validate request fields
    // =====================================================

    if (!service) {
      return NextResponse.json(
        {
          ok: false,
          error: "Select a service.",
        },
        { status: 400 },
      );
    }

    if (!ZIP_CODE_PATTERN.test(zipCode)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enter a valid 5-digit ZIP code.",
        },
        { status: 400 },
      );
    }

    if (
      serviceNeededDate &&
      !isValidDateString(serviceNeededDate)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enter a valid service date.",
        },
        { status: 400 },
      );
    }

    if (!details) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tell us what you need help with.",
        },
        { status: 400 },
      );
    }

    if (
      notificationEmail &&
      !EMAIL_PATTERN.test(notificationEmail)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enter a valid email address.",
        },
        { status: 400 },
      );
    }

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          ok: false,
          error: `You can upload up to ${MAX_IMAGES} photos.`,
        },
        { status: 400 },
      );
    }

    for (const image of images) {
      if (!ALLOWED_IMAGE_MIMES.has(image.type)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Photos must be JPG, PNG, or WebP.",
          },
          { status: 400 },
        );
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          {
            ok: false,
            error: "Each photo must be 5MB or smaller.",
          },
          { status: 400 },
        );
      }
    }

    const supabase = getSupabaseAdmin();

    // =====================================================
    // Validate service against Connect catalog
    // =====================================================

    const { data: serviceRow, error: serviceError } =
      await supabase
        .from("connect_services")
        .select("id, name")
        .eq("name", service)
        .eq("active", true)
        .maybeSingle();

    if (serviceError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unable to validate the selected service.",
        },
        { status: 500 },
      );
    }

    if (!serviceRow) {
      return NextResponse.json(
        {
          ok: false,
          error: "The selected service is not available.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Create Connect request
    // =====================================================

    const requestCode = createRequestCode();

    const { data: requestRow, error: requestError } =
      await supabase
        .from("connect_requests")
        .insert({
          request_code: requestCode,
          service: serviceRow.name,
          zip_code: zipCode,
          service_needed_date: serviceNeededDate || null,
          details,
          notification_email: notificationEmail || null,
          status: "open",
        })
        .select("id, request_code, created_at")
        .single();

    if (requestError || !requestRow) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unable to create your request.",
        },
        { status: 500 },
      );
    }

    // =====================================================
    // Upload private request photos
    // =====================================================

    const photoRows: {
      request_id: string;
      storage_path: string;
      original_file_name: string;
      mime_type: string;
      file_size_bytes: number;
      sort_order: number;
    }[] = [];

    for (
      let index = 0;
      index < images.length;
      index += 1
    ) {
      const image = images[index];

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const storagePath = [
        requestRow.id,
        `${Date.now()}_${index}_${crypto
          .randomBytes(4)
          .toString("hex")}_${safeFileName(
          image.name ||
            `request-photo-${index + 1}`,
        )}`,
      ].join("/");

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: image.type,
            upsert: false,
          });

      if (uploadError) {
        await removeCreatedRequest(
          supabase,
          requestRow.id,
          uploadedPaths,
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Unable to upload request photos.",
          },
          { status: 500 },
        );
      }

      uploadedPaths.push(storagePath);

      photoRows.push({
        request_id: requestRow.id,
        storage_path: storagePath,
        original_file_name:
          image.name ||
          `request-photo-${index + 1}`,
        mime_type: image.type,
        file_size_bytes: image.size,
        sort_order: index,
      });
    }

    if (photoRows.length > 0) {
      const { error: photoInsertError } =
        await supabase
          .from("connect_request_photos")
          .insert(photoRows);

      if (photoInsertError) {
        await removeCreatedRequest(
          supabase,
          requestRow.id,
          uploadedPaths,
        );

        return NextResponse.json(
          {
            ok: false,
            error: "Unable to save request photos.",
          },
          { status: 500 },
        );
      }
    }

    // =====================================================
    // Create private consumer mailbox
    // =====================================================

    let mailboxCode = "";
    let mailboxPin = "";
    let mailboxCreated = false;

    for (
      let attempt = 0;
      attempt < 5;
      attempt += 1
    ) {
      const candidateCode = createMailboxCode();
      const candidatePin = createMailboxPin();
      const candidatePinHash =
        hashMailboxPin(candidatePin);

      const { error: mailboxInsertError } =
        await supabase
          .from("connect_mailboxes")
          .insert({
            request_id: requestRow.id,
            mailbox_code: candidateCode,
            pin_hash: candidatePinHash,
            status: "active",
          });

      if (!mailboxInsertError) {
        mailboxCode = candidateCode;
        mailboxPin = candidatePin;
        mailboxCreated = true;
        break;
      }

      if (mailboxInsertError.code === "23505") {
        continue;
      }

      await removeCreatedRequest(
        supabase,
        requestRow.id,
        uploadedPaths,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to create your private mailbox.",
        },
        { status: 500 },
      );
    }

    if (!mailboxCreated) {
      await removeCreatedRequest(
        supabase,
        requestRow.id,
        uploadedPaths,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to create a unique private mailbox.",
        },
        { status: 500 },
      );
    }

    // =====================================================
    // Match request to eligible Connect providers
    // =====================================================
    //
    // V1 routing:
    //
    // 1. Provider must be enabled.
    // 2. Provider's microsite must be published and active.
    // 3. Provider must offer the requested service.
    // 4. Provider must currently have the SAME ZIP code.
    //
    // The provider's configured radius is already stored, but true
    // radius matching requires ZIP -> geographic coordinates. Until
    // that geographic layer is added, we deliberately use exact ZIP
    // matching rather than pretending ZIP codes represent mileage.
    //
    // Matches are persisted in connect_request_matches.
    // =====================================================

    const {
      data: providerServiceRows,
      error: providerServiceError,
    } = await supabase
      .from("connect_provider_services")
      .select(
        `
          provider_profile_id,
          connect_provider_profiles!inner (
            id,
            enabled,
            service_zip_code,
            microsite_id,
            microsites!inner (
              id,
              is_published,
              is_active
            )
          )
        `,
      )
      .eq("service_id", serviceRow.id)
      .eq("connect_provider_profiles.enabled", true)
      .eq(
        "connect_provider_profiles.service_zip_code",
        zipCode,
      )
      .eq(
        "connect_provider_profiles.microsites.is_published",
        true,
      )
      .neq(
        "connect_provider_profiles.microsites.is_active",
        false,
      );

    if (providerServiceError) {
      console.error(
        "Connect provider matching failed:",
        providerServiceError,
      );

      /*
       * The consumer's request and mailbox are still valid.
       * Do not destroy the request merely because provider
       * routing encountered an internal error.
       *
       * This can later be retried administratively.
       */
    } else {
      const providerProfileIds = Array.from(
        new Set(
          (providerServiceRows ?? [])
            .map((row) =>
              String(row.provider_profile_id || ""),
            )
            .filter(Boolean),
        ),
      );

      if (providerProfileIds.length > 0) {
        const matchRows = providerProfileIds.map(
          (providerProfileId) => ({
            request_id: requestRow.id,
            provider_profile_id: providerProfileId,
            status: "new",
          }),
        );

        const { error: matchInsertError } =
          await supabase
            .from("connect_request_matches")
            .upsert(matchRows, {
              onConflict:
                "request_id,provider_profile_id",
              ignoreDuplicates: true,
            });

        if (matchInsertError) {
          console.error(
            "Connect request match insert failed:",
            matchInsertError,
          );
        }
      }
    }

    // =====================================================
    // Successful request + mailbox creation
    // =====================================================

    return NextResponse.json({
      ok: true,

      request: {
        code: requestRow.request_code,
        createdAt: requestRow.created_at,
      },

      mailbox: {
        code: mailboxCode,

        // Returned once to the consumer.
        // Never persisted in plaintext.
        pin: mailboxPin,

        path: `/mailbox/${mailboxCode}`,
      },
    });
  } catch (error) {
    console.error(
      "Connect request submission error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected request submission error.",
      },
      { status: 500 },
    );
  }
}