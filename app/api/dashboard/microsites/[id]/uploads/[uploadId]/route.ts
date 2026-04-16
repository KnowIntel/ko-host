import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  sanitizeBuilderDraft,
  type BuilderDraft,
} from "@/lib/templates/builder";

type RouteContext = {
  params: Promise<{ id: string; uploadId: string }>;
};

function safeDownloadName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id, uploadId } = await context.params;
    const micrositeId = String(id || "").trim();
    const safeUploadId = String(uploadId || "").trim();
const accessCode = String(
  request.nextUrl.searchParams.get("accessCode") ?? "",
).trim();
const preview = request.nextUrl.searchParams.get("preview") === "1";

    if (!micrositeId || !safeUploadId) {
      return NextResponse.json(
        { error: "Missing upload route params." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: uploadRow, error: uploadError } = await supabaseAdmin
      .from("file_share_uploads")
      .select(
        "id, microsite_id, block_id, storage_path, original_filename, mime_type",
      )
      .eq("id", safeUploadId)
      .eq("microsite_id", micrositeId)
      .single();

    if (uploadError || !uploadRow) {
      return NextResponse.json(
        { error: "Upload not found." },
        { status: 404 },
      );
    }

    const { data: microsite, error: micrositeError } = await supabaseAdmin
      .from("microsites")
      .select("id, draft")
      .eq("id", micrositeId)
      .single();

    if (micrositeError || !microsite) {
      return NextResponse.json(
        { error: "Microsite not found." },
        { status: 404 },
      );
    }

    const { data: pages, error: pagesError } = await supabaseAdmin
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
      (item) => item.id === uploadRow.block_id && item.type === "file_share",
    );

    if (!block || block.type !== "file_share") {
      return NextResponse.json(
        { error: "File Share block not found." },
        { status: 404 },
      );
    }

    if (
      block.data.requireAccessCode &&
      (block.data.accessCode ?? "").trim() !== accessCode
    ) {
      return NextResponse.json(
        { error: "Valid access code required for download." },
        { status: 403 },
      );
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("file-share-uploads")
      .download(uploadRow.storage_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download file." },
        { status: 500 },
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": uploadRow.mime_type || "application/octet-stream",
        ...(preview
          ? {}
          : {
              "Content-Disposition": `attachment; filename="${safeDownloadName(
                uploadRow.original_filename || "download",
              )}"`,
            }),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id, uploadId } = await context.params;
    const micrositeId = String(id || "").trim();
    const safeUploadId = String(uploadId || "").trim();

    if (!micrositeId || !safeUploadId) {
      return NextResponse.json(
        { error: "Missing upload route params." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: uploadRow, error: uploadError } = await supabaseAdmin
      .from("file_share_uploads")
      .select("id, microsite_id, storage_path")
      .eq("id", safeUploadId)
      .eq("microsite_id", micrositeId)
      .single();

    if (uploadError || !uploadRow) {
      return NextResponse.json(
        { error: "Upload not found." },
        { status: 404 },
      );
    }

    const { error: storageDeleteError } = await supabaseAdmin.storage
      .from("file-share-uploads")
      .remove([uploadRow.storage_path]);

    if (storageDeleteError) {
      return NextResponse.json(
        { error: "Failed to delete file from storage." },
        { status: 500 },
      );
    }

    const { error: rowDeleteError } = await supabaseAdmin
      .from("file_share_uploads")
      .delete()
      .eq("id", safeUploadId)
      .eq("microsite_id", micrositeId);

    if (rowDeleteError) {
      return NextResponse.json(
        { error: "Failed to delete upload record." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error.",
      },
      { status: 500 },
    );
  }
}