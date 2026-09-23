import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MicrositeRow = {
  id: string;
  owner_clerk_user_id: string;
};

type ProviderProfileRow = {
  id: string;
};

type ConnectRequestRow = {
  id: string;
  request_code: string;
};

type RequestMatchRow = {
  id: string;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
};

const ALLOWED_STATUSES = ["scheduled", "completed"] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return (
    typeof value === "string" &&
    ALLOWED_STATUSES.includes(value as AllowedStatus)
  );
}

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      requestCode: string;
    }>;
  },
) {
  try {
    const { id: micrositeId, requestCode } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    /*
     * Read the requested provider-side status.
     */
    const body = await req.json().catch(() => null);

    const nextStatus = body?.status;

    if (!isAllowedStatus(nextStatus)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Status must be scheduled or completed",
        },
        { status: 400 },
      );
    }

    const sb = getSupabaseAdmin();

    /*
     * Verify that the current Clerk user owns
     * the microsite.
     */
    const { data: siteData, error: siteError } = await sb
      .from("microsites")
      .select("id, owner_clerk_user_id")
      .eq("id", micrositeId)
      .maybeSingle();

    const site =
      siteData as unknown as MicrositeRow | null;

    if (siteError || !site) {
      return NextResponse.json(
        {
          ok: false,
          error: "Microsite not found",
        },
        { status: 404 },
      );
    }

    if (site.owner_clerk_user_id !== userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 },
      );
    }

    /*
     * Load this microsite's provider profile.
     *
     * We intentionally do not require Connect to
     * currently be enabled here. A provider may
     * still need to finish the lifecycle of an
     * existing matched request after disabling
     * new Connect requests.
     */
    const { data: providerData, error: providerError } = await sb
      .from("connect_provider_profiles")
      .select("id")
      .eq("microsite_id", micrositeId)
      .maybeSingle();

    const providerProfile =
      providerData as unknown as ProviderProfileRow | null;

    if (providerError || !providerProfile) {
      return NextResponse.json(
        {
          ok: false,
          error: "Connect provider profile not found",
        },
        { status: 404 },
      );
    }

    /*
     * Resolve the consumer request from its
     * public-safe request code.
     */
    const { data: requestData, error: requestError } = await sb
      .from("connect_requests")
      .select("id, request_code")
      .eq("request_code", requestCode)
      .maybeSingle();

    const connectRequest =
      requestData as unknown as ConnectRequestRow | null;

    if (requestError || !connectRequest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Connect request not found",
        },
        { status: 404 },
      );
    }

    /*
     * Critical authorization check.
     *
     * Status may only be changed for the
     * provider/request assignment belonging to
     * this provider profile.
     */
    const { data: matchData, error: matchError } = await sb
      .from("connect_request_matches")
      .select(
        "id, status, scheduled_at, completed_at",
      )
      .eq("request_id", connectRequest.id)
      .eq("provider_profile_id", providerProfile.id)
      .maybeSingle();

    const match =
      matchData as unknown as RequestMatchRow | null;

    if (matchError || !match) {
      /*
       * Do not expose request existence to an
       * unmatched provider.
       */
      return NextResponse.json(
        {
          ok: false,
          error: "Connect request not found",
        },
        { status: 404 },
      );
    }

    if (match.status === "closed") {
      return NextResponse.json(
        {
          ok: false,
          error: "This provider request is closed",
        },
        { status: 409 },
      );
    }

    /*
     * Completed is terminal for this workflow.
     *
     * Prevent accidentally moving a completed
     * service backward to Scheduled.
     */
    if (
      match.status === "completed" &&
      nextStatus !== "completed"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "A completed request cannot be moved back to scheduled",
        },
        { status: 409 },
      );
    }

    /*
     * Repeating the current status is harmless.
     */
    if (match.status === nextStatus) {
      return NextResponse.json({
        ok: true,
        status: match.status,
        unchanged: true,
      });
    }

    const nowIso = new Date().toISOString();

    const updatePayload: {
      status: AllowedStatus;
      updated_at: string;
      scheduled_at?: string;
      completed_at?: string;
    } = {
      status: nextStatus,
      updated_at: nowIso,
    };

    if (nextStatus === "scheduled") {
      /*
       * Preserve the first time the service was
       * marked Scheduled.
       */
      if (!match.scheduled_at) {
        updatePayload.scheduled_at = nowIso;
      }
    }

    if (nextStatus === "completed") {
      /*
       * Preserve the first Completed timestamp.
       */
      if (!match.completed_at) {
        updatePayload.completed_at = nowIso;
      }
    }

    const { data: updatedData, error: updateError } = await sb
      .from("connect_request_matches")
      .update(updatePayload)
      .eq("id", match.id)
      .neq("status", "closed")
      .select(
        "id, status, scheduled_at, completed_at",
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "Connect request status update failed",
        {
          matchId: match.id,
          nextStatus,
          updateError,
        },
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to update request status",
        },
        { status: 500 },
      );
    }

    if (!updatedData) {
      return NextResponse.json(
        {
          ok: false,
          error: "Request status could not be updated",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: updatedData.status,
      scheduledAt: updatedData.scheduled_at,
      completedAt: updatedData.completed_at,
    });
  } catch (error) {
    console.error(
      "Connect provider status handler failed",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Server error",
      },
      { status: 500 },
    );
  }
}