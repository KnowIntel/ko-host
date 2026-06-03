import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "enrollment-board-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function hashVisitorToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function publicEntry(row: any, visitorTokenHash?: string) {
  const isMine =
    Boolean(visitorTokenHash) && row.visitor_token_hash === visitorTokenHash;

  return {
    id: row.id,
    name: row.name,
    quote: row.quote,
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at,
    isMine,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId = searchParams.get("micrositeId")?.trim() ?? "";
    const blockId = searchParams.get("blockId")?.trim() ?? "";
    const visitorToken = searchParams.get("visitorToken")?.trim() ?? "";

    if (!micrositeId || !blockId) {
      return NextResponse.json(
        { error: "Missing micrositeId or blockId." },
        { status: 400 },
      );
    }

    const visitorTokenHash = visitorToken
      ? hashVisitorToken(visitorToken)
      : undefined;

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("enrollment_board_entries")
      .select(
        "id, name, quote, profile_image_url, visitor_token_hash, created_at",
      )
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to load enrollments." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      entries: (data ?? []).map((row) => publicEntry(row, visitorTokenHash)),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected enrollment load error.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const micrositeId = String(formData.get("micrositeId") ?? "").trim();
    const blockId = String(formData.get("blockId") ?? "").trim();
    const visitorToken = String(formData.get("visitorToken") ?? "").trim();

    const name = String(formData.get("name") ?? "").trim();
    const quote = String(formData.get("quote") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    const imageValue = formData.get("image");
    const image = imageValue instanceof File ? imageValue : null;

    if (!micrositeId || !blockId || !visitorToken) {
      return NextResponse.json(
        { error: "Missing micrositeId, blockId, or visitorToken." },
        { status: 400 },
      );
    }

    if (!name) {
      if (name.length > 20) {
  return NextResponse.json(
    { error: "Name must be 20 characters or less." },
    { status: 400 },
  );
}
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 },
      );
    }

if (quote.length > 80) {
  return NextResponse.json(
    { error: "Quote must be 80 characters or less." },
        { status: 400 },
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (image) {
      if (!ALLOWED_IMAGE_MIMES.has(image.type)) {
        return NextResponse.json(
          { error: "Profile image must be JPG, PNG, or WebP." },
          { status: 400 },
        );
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Profile image must be 5MB or smaller." },
          { status: 400 },
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const visitorTokenHash = hashVisitorToken(visitorToken);

    const { data: existingEntry, error: existingError } = await supabase
      .from("enrollment_board_entries")
      .select("id")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("visitor_token_hash", visitorTokenHash)
      .eq("status", "active")
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Failed to check existing enrollment." },
        { status: 500 },
      );
    }

    if (existingEntry) {
      return NextResponse.json(
        { error: "You’re already enrolled from this device." },
        { status: 409 },
      );
    }

    let profileImageUrl: string | null = null;
    let profileImageStoragePath: string | null = null;

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      profileImageStoragePath = [
        micrositeId,
        blockId,
        `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}_${safeFileName(image.name || "profile-image")}`,
      ].join("/");

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(profileImageStoragePath, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: "Profile image upload failed." },
          { status: 500 },
        );
      }

      profileImageUrl = supabase.storage
        .from(BUCKET)
        .getPublicUrl(profileImageStoragePath).data.publicUrl;
    }

    const { data: insertedRow, error: insertError } = await supabase
      .from("enrollment_board_entries")
      .insert({
        microsite_id: micrositeId,
        block_id: blockId,
        name,
        quote: quote || null,
        email: email || null,
        profile_image_url: profileImageUrl,
        profile_image_storage_path: profileImageStoragePath,
        visitor_token_hash: visitorTokenHash,
        status: "active",
      })
      .select(
        "id, name, quote, profile_image_url, visitor_token_hash, created_at",
      )
      .single();

    if (insertError || !insertedRow) {
      return NextResponse.json(
        { error: "Failed to create enrollment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      entry: publicEntry(insertedRow, visitorTokenHash),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected enrollment create error.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const micrositeId = String(body?.micrositeId ?? "").trim();
    const blockId = String(body?.blockId ?? "").trim();
    const entryId = String(body?.entryId ?? "").trim();
    const visitorToken = String(body?.visitorToken ?? "").trim();

    if (!micrositeId || !blockId || !entryId || !visitorToken) {
      return NextResponse.json(
        { error: "Missing required delete fields." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const visitorTokenHash = hashVisitorToken(visitorToken);

    const { data: entry, error: entryError } = await supabase
      .from("enrollment_board_entries")
      .select("id")
      .eq("id", entryId)
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .eq("visitor_token_hash", visitorTokenHash)
      .eq("status", "active")
      .maybeSingle();

    if (entryError) {
      return NextResponse.json(
        { error: "Failed to verify enrollment." },
        { status: 500 },
      );
    }

    if (!entry) {
      return NextResponse.json(
        { error: "Enrollment not found or cannot be deleted from this device." },
        { status: 404 },
      );
    }

    const { error: updateError } = await supabase
      .from("enrollment_board_entries")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to delete enrollment." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected enrollment delete error.",
      },
      { status: 500 },
    );
  }
}