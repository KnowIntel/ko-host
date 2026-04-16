import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function isPreviewableImage(
  mimeType: string | null,
  filename: string,
) {
  const lowerName = filename.toLowerCase();

  return (
    (mimeType ? IMAGE_MIME_TYPES.includes(mimeType.toLowerCase()) : false) ||
    IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const micrositeId = String(id || "").trim();

    if (!micrositeId) {
      return NextResponse.json(
        { error: "Missing microsite id." },
        { status: 400 },
      );
    }

    const sort = String(
      request.nextUrl.searchParams.get("sort") ?? "newest",
    ).trim();

    const fileType = String(
      request.nextUrl.searchParams.get("fileType") ?? "",
    ).trim().toLowerCase();

    const search = String(
      request.nextUrl.searchParams.get("search") ?? "",
    ).trim().toLowerCase();

    const supabaseAdmin = getSupabaseAdmin();

    let query = supabaseAdmin
      .from("file_share_uploads")
      .select(
        "id, block_id, storage_path, original_filename, mime_type, size_bytes, uploader_name, uploader_email, uploader_message, uploaded_at",
      )
      .eq("microsite_id", micrositeId);

    if (sort === "oldest") {
      query = query.order("uploaded_at", { ascending: true });
    } else if (sort === "largest") {
      query = query.order("size_bytes", { ascending: false });
    } else if (sort === "smallest") {
      query = query.order("size_bytes", { ascending: true });
    } else {
      query = query.order("uploaded_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to load uploads." },
        { status: 500 },
      );
    }

    let uploads = (data ?? []).map((item) => {
      const previewable = isPreviewableImage(
        item.mime_type ?? null,
        item.original_filename ?? "",
      );

      return {
        ...item,
        preview_url: previewable
          ? `/api/dashboard/microsites/${micrositeId}/uploads/${item.id}?preview=1`
          : null,
      };
    });

    if (fileType) {
      uploads = uploads.filter((item) => {
        const mime = (item.mime_type ?? "").toLowerCase();
        const name = (item.original_filename ?? "").toLowerCase();

        if (fileType === "images") {
          return isPreviewableImage(item.mime_type ?? null, item.original_filename ?? "");
        }

        if (fileType === "pdf") {
          return mime === "application/pdf" || name.endsWith(".pdf");
        }

        if (fileType === "doc") {
          return (
            mime.includes("word") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
          );
        }

        if (fileType === "txt") {
          return mime.startsWith("text/") || name.endsWith(".txt");
        }

        return true;
      });
    }

    if (search) {
      uploads = uploads.filter((item) => {
        const haystack = [
          item.original_filename,
          item.uploader_name,
          item.uploader_email,
          item.uploader_message,
          item.block_id,
        ]
          .map((value) => String(value ?? "").toLowerCase())
          .join(" ");

        return haystack.includes(search);
      });
    }

    return NextResponse.json({
      uploads,
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