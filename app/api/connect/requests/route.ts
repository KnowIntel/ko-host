// app/api/connect/requests/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const BUCKET = "connect-request-images";
const resend = new Resend(process.env.RESEND_API_KEY);

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

function calculateDistanceMiles(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const EARTH_RADIUS_MILES = 3958.8;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const deltaLat = toRadians(latitude2 - latitude1);
  const deltaLon = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return EARTH_RADIUS_MILES * c;
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
    // Provider eligibility:
    //
    // 1. Provider must be enabled.
    // 2. Provider's microsite must be published and active.
    // 3. Provider must offer the requested service.
    // 4. Request ZIP must fall within the provider's
    //    configured 5 / 10 / 25 / 50-mile service radius.
    //
    // Distance is calculated between Census ZIP/ZCTA
    // representative coordinates using the Haversine formula.
    //
    // Matches are persisted in connect_request_matches.
    // =====================================================

    const {
      data: requestZipRow,
      error: requestZipError,
    } = await supabase
      .from("connect_zip_codes")
      .select("latitude, longitude")
      .eq("zip_code", zipCode)
      .maybeSingle();

    if (requestZipError) {
      console.error(
        "Connect request ZIP lookup failed:",
        requestZipError,
      );
    } else if (!requestZipRow) {
      console.error(
        `Connect request ZIP ${zipCode} was not found in connect_zip_codes.`,
      );
    } else {
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
              service_radius_miles,
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
        .eq(
          "connect_provider_profiles.enabled",
          true,
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
      } else {
type EligibleProvider = {
  providerProfileId: string;
  zipCode: string;
  radiusMiles: number;
};

const eligibleProviders: EligibleProvider[] = [];

for (const row of providerServiceRows ?? []) {
  const profile = Array.isArray(
    row.connect_provider_profiles,
  )
    ? row.connect_provider_profiles[0]
    : row.connect_provider_profiles;

  if (!profile) {
    continue;
  }

  const providerProfileId = String(
    row.provider_profile_id ?? "",
  );

  const providerZipCode = String(
    profile.service_zip_code ?? "",
  );

  const radiusMiles = Number(
    profile.service_radius_miles ?? 0,
  );

  if (!providerProfileId) {
    continue;
  }

  if (!ZIP_CODE_PATTERN.test(providerZipCode)) {
    continue;
  }

  if (![5, 10, 25, 50].includes(radiusMiles)) {
    continue;
  }

  eligibleProviders.push({
    providerProfileId,
    zipCode: providerZipCode,
    radiusMiles,
  });
}

        const providerZipCodes = Array.from(
          new Set(
            eligibleProviders.map(
              (provider) => provider.zipCode,
            ),
          ),
        );

        if (providerZipCodes.length > 0) {
          const {
            data: providerZipRows,
            error: providerZipError,
          } = await supabase
            .from("connect_zip_codes")
            .select(
              "zip_code, latitude, longitude",
            )
            .in("zip_code", providerZipCodes);

          if (providerZipError) {
            console.error(
              "Connect provider ZIP lookup failed:",
              providerZipError,
            );
          } else {
            const coordinatesByZip = new Map(
              (providerZipRows ?? []).map(
                (row) => [
                  String(row.zip_code),
                  {
                    latitude: Number(
                      row.latitude,
                    ),
                    longitude: Number(
                      row.longitude,
                    ),
                  },
                ],
              ),
            );

            const providerProfileIds =
              Array.from(
                new Set(
                  eligibleProviders
                    .filter((provider) => {
                      const coordinates =
                        coordinatesByZip.get(
                          provider.zipCode,
                        );

                      if (!coordinates) {
                        console.error(
                          `Connect provider ZIP ${provider.zipCode} was not found in connect_zip_codes.`,
                        );

                        return false;
                      }

                      const distanceMiles =
                        calculateDistanceMiles(
                          Number(
                            requestZipRow.latitude,
                          ),
                          Number(
                            requestZipRow.longitude,
                          ),
                          coordinates.latitude,
                          coordinates.longitude,
                        );

                      return (
                        distanceMiles <=
                        provider.radiusMiles
                      );
                    })
                    .map(
                      (provider) =>
                        provider.providerProfileId,
                    ),
                ),
              );

            if (
              providerProfileIds.length > 0
            ) {
              const matchRows =
                providerProfileIds.map(
                  (providerProfileId) => ({
                    request_id:
                      requestRow.id,
                    provider_profile_id:
                      providerProfileId,
                    status: "new",
                  }),
                );

              const {
                error: matchInsertError,
              } = await supabase
                .from(
                  "connect_request_matches",
                )
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
        }
      }
    }

// =====================================================
// Send consumer confirmation email
// =====================================================
//
// Email is best-effort. A temporary email failure must
// not destroy an otherwise valid Connect request/mailbox.
// The mailbox URL and PIN are also returned on-screen.
// =====================================================

if (notificationEmail) {
  const mailboxUrl =
    `${request.nextUrl.origin}/mailbox/${mailboxCode}`;

  try {
    const confirmationSend = await resend.emails.send({
      from: "Ko-Host Connect <support@ko-host.com>",
      to: [notificationEmail],
      subject: `Your Ko-Host Connect request: ${serviceRow.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto;">
          <h2 style="margin-bottom: 8px;">
            Your Ko-Host Connect request is live
          </h2>

          <p>
            Your request has been submitted and eligible local providers
            can now respond privately through your Ko-Host Mailbox.
          </p>

          <div style="margin: 24px 0; padding: 20px; background: #f5f5f4; border-radius: 12px;">
            <p style="margin: 0 0 8px;">
              <strong>Service:</strong> ${serviceRow.name}
            </p>

            <p style="margin: 0 0 8px;">
              <strong>ZIP Code:</strong> ${zipCode}
            </p>

            <p style="margin: 0 0 8px;">
              <strong>Service Needed:</strong> ${
                serviceNeededDate || "Not specified"
              }
            </p>

            <p style="margin: 0;">
              <strong>Request Code:</strong> ${requestRow.request_code}
            </p>
          </div>

          <h3>Your private mailbox</h3>

          <p>
            Providers will communicate with you through this private mailbox.
            Your email address is not shared with providers.
          </p>

          <p>
            <strong>Mailbox:</strong><br />
            <a href="${mailboxUrl}">${mailboxUrl}</a>
          </p>

          <p>
            <strong>Mailbox PIN:</strong><br />
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
              ${mailboxPin}
            </span>
          </p>

          <p>
            Keep this PIN private. You will need it to access your mailbox.
          </p>

<p>
  Your Ko-Host Connect mailbox is available for 30 days.
</p>

          <div style="margin-top: 28px;">
            <a
              href="${mailboxUrl}"
              style="display: inline-block; background: #171717; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-weight: bold;"
            >
              Open My Mailbox
            </a>
          </div>

          <p style="margin-top: 32px; color: #737373; font-size: 13px;">
            Ko-Host Connect keeps provider conversations private and
            separate. Providers cannot see your conversations with other
            providers.
          </p>

          <p style="margin-top: 24px;">
            — Ko-Host Connect
          </p>
        </div>
      `,
    });

    if (confirmationSend.error) {
      console.error(
        "Connect confirmation email failed:",
        confirmationSend.error,
      );
    }
  } catch (emailError) {
    console.error(
      "Connect confirmation email failed:",
      emailError,
    );
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