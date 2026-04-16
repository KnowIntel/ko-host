import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import {
  sanitizeBuilderDraft,
  type BuilderDraft,
} from "@/lib/templates/builder";

const DEFAULT_ALLOWED_TYPES = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "doc",
  "docx",
  "txt",
];

const DEFAULT_MAX_FILE_SIZE_MB = 25;

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function getFileExtension(filename: string) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

function safeFileName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function sendOwnerUploadAlert(args: {
  toEmail: string;
  micrositeId: string;
  originalFilename: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderMessage: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.FILE_SHARE_ALERT_FROM_EMAIL || "onboarding@resend.dev";

  if (!resendApiKey || !args.toEmail) {
    return;
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: fromEmail,
    to: [args.toEmail],
    subject: "New file upload",
    text: [
      `Microsite ID: ${args.micrositeId}`,
      `Filename: ${args.originalFilename}`,
      `Uploader Name: ${args.uploaderName || "—"}`,
      `Uploader Email: ${args.uploaderEmail || "—"}`,
      `Message: ${args.uploaderMessage || "—"}`,
    ].join("\n"),
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const micrositeId = String(formData.get("micrositeId") ?? "").trim();
    const blockId = String(formData.get("blockId") ?? "").trim();
    const accessCode = String(formData.get("accessCode") ?? "").trim();
    const uploaderName = String(formData.get("name") ?? "").trim();
    const uploaderEmail = String(formData.get("email") ?? "").trim();
    const uploaderMessage = String(formData.get("message") ?? "").trim();

    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (!micrositeId) {
      return NextResponse.json(
        { error: "Missing micrositeId." },
        { status: 400 },
      );
    }

    if (!blockId) {
      return NextResponse.json(
        { error: "Missing blockId." },
        { status: 400 },
      );
    }

    if (!files.length) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 },
      );
    }

    const supabase = getAdminSupabase();

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, draft, owner_clerk_user_id")
      .eq("id", micrositeId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    let ownerEmail = "";

    if (microsite.owner_clerk_user_id) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(microsite.owner_clerk_user_id);

        ownerEmail =
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          "";
      } catch {
        ownerEmail = "";
      }
    }

    const { data: pages, error: pagesError } = await supabase
      .from("microsite_pages")
      .select("id, draft, display_order, created_at")
      .eq("microsite_id", micrositeId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1);

    if (pagesError) {
      return NextResponse.json(
        { error: "Failed to load microsite page draft." },
        { status: 500 },
      );
    }

    const firstPage = pages?.[0] ?? null;
    const resolvedDraftSource =
      firstPage?.draft &&
      typeof firstPage.draft === "object" &&
      Array.isArray((firstPage.draft as BuilderDraft).blocks) &&
      (firstPage.draft as BuilderDraft).blocks.length > 0
        ? firstPage.draft
        : microsite.draft;

    const draft = sanitizeBuilderDraft(resolvedDraftSource ?? {});
    const block = draft.blocks.find(
      (item) => item.id === blockId && item.type === "file_share",
    );

    if (!block || block.type !== "file_share") {
      return NextResponse.json(
        { error: "File Share block not found." },
        { status: 404 },
      );
    }

    if (!block.data.allowPublicUpload) {
      return NextResponse.json(
        { error: "Public uploads are disabled for this block." },
        { status: 403 },
      );
    }

    if (
      block.data.requireAccessCode &&
      (block.data.accessCode ?? "").trim() !== accessCode
    ) {
      return NextResponse.json(
        { error: "Invalid access code." },
        { status: 403 },
      );
    }

    if (!block.data.allowMultiple && files.length > 1) {
      return NextResponse.json(
        { error: "Only one file is allowed." },
        { status: 400 },
      );
    }

    const allowedTypes =
      Array.isArray(block.data.acceptedFileTypes) &&
      block.data.acceptedFileTypes.length
        ? block.data.acceptedFileTypes.map((item) => item.toLowerCase())
        : DEFAULT_ALLOWED_TYPES;

    const maxFileSizeMb =
      typeof block.data.maxFileSizeMb === "number"
        ? block.data.maxFileSizeMb
        : DEFAULT_MAX_FILE_SIZE_MB;

    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

    const uploads: Array<{
      id: string;
      filename: string;
      sizeBytes: number;
    }> = [];

    for (const file of files) {
      const extension = getFileExtension(file.name);

      if (!allowedTypes.includes(extension)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 },
        );
      }

      if (file.size > maxFileSizeBytes) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 },
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const storagePath = [
        micrositeId,
        blockId,
        `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeFileName(file.name)}`,
      ].join("/");

      const { error: uploadError } = await supabase.storage
        .from("file-share-uploads")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload failed: ${file.name}` },
          { status: 500 },
        );
      }

      const { data: insertedRow, error: insertError } = await supabase
        .from("file_share_uploads")
        .insert({
          microsite_id: micrositeId,
          block_id: blockId,
          storage_path: storagePath,
          original_filename: file.name,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          uploader_name: block.data.collectName ? uploaderName || null : null,
          uploader_email: block.data.collectEmail ? uploaderEmail || null : null,
          uploader_message: block.data.collectMessage
            ? uploaderMessage || null
            : null,
        })
        .select("id")
        .single();

      if (insertError || !insertedRow) {
        return NextResponse.json(
          { error: `Database insert failed: ${file.name}` },
          { status: 500 },
        );
      }

      uploads.push({
        id: insertedRow.id,
        filename: file.name,
        sizeBytes: file.size,
      });

      if (block.data.ownerAlertOnUpload !== false) {
        await sendOwnerUploadAlert({
          toEmail: ownerEmail,
          micrositeId,
          originalFilename: file.name,
          uploaderName: block.data.collectName ? uploaderName : "",
          uploaderEmail: block.data.collectEmail ? uploaderEmail : "",
          uploaderMessage: block.data.collectMessage ? uploaderMessage : "",
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploads,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected upload error.",
      },
      { status: 500 },
    );
  }
}