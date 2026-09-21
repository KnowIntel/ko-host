import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const expectedAuthorization = `Bearer ${process.env.CRON_SECRET}`;

  if (
    !process.env.CRON_SECRET ||
    authorization !== expectedAuthorization
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();

  try {
    // =====================================================
    // Find requests whose mailboxes have expired
    // =====================================================

    const {
      data: expiredMailboxes,
      error: mailboxError,
    } = await sb
      .from("connect_mailboxes")
      .select("id, request_id, mailbox_code, expires_at")
      .lte("expires_at", now)
      .limit(500);

    if (mailboxError) {
      throw mailboxError;
    }

    if (!expiredMailboxes?.length) {
      return NextResponse.json({
        ok: true,
        deletedRequests: 0,
        deletedPhotos: 0,
        message: "No expired Connect mailboxes found.",
      });
    }

    const requestIds = Array.from(
      new Set(
        expiredMailboxes.map(
          (mailbox) => mailbox.request_id,
        ),
      ),
    );

    // =====================================================
    // Load private photo paths before deleting DB records
    // =====================================================

    const {
      data: photoRows,
      error: photoError,
    } = await sb
      .from("connect_request_photos")
      .select("request_id, storage_path")
      .in("request_id", requestIds);

    if (photoError) {
      throw photoError;
    }

    const storagePaths = Array.from(
      new Set(
        (photoRows ?? [])
          .map((photo) => photo.storage_path)
          .filter(
            (path): path is string =>
              typeof path === "string" &&
              path.length > 0,
          ),
      ),
    );

    // =====================================================
    // Delete private Storage objects first
    // =====================================================

    if (storagePaths.length > 0) {
      const { error: storageError } =
        await sb.storage
          .from("connect-request-images")
          .remove(storagePaths);

      if (storageError) {
        throw storageError;
      }
    }

    // =====================================================
    // Delete requests
    //
    // Foreign-key cascades remove:
    // - photo metadata
    // - mailbox
    // - mailbox threads/messages
    // - request matches
    // =====================================================

    const {
      data: deletedRequests,
      error: deleteError,
    } = await sb
      .from("connect_requests")
      .delete()
      .in("id", requestIds)
      .select("id");

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      ok: true,
      deletedRequests:
        deletedRequests?.length ?? 0,
      deletedPhotos: storagePaths.length,
    });
  } catch (error) {
    console.error(
      "Connect cleanup failed:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Connect cleanup failed.",
      },
      {
        status: 500,
      },
    );
  }
}