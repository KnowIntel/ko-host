import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendSubmissionNotification } from "@/lib/forms/sendSubmissionNotification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const micrositeId =
      typeof body?.micrositeId === "string" ? body.micrositeId.trim() : "";
    const pageSlug =
      typeof body?.pageSlug === "string" ? body.pageSlug.trim() : "";
    const templateKey =
      typeof body?.templateKey === "string" ? body.templateKey.trim() : "";
    const designKey =
      typeof body?.designKey === "string" ? body.designKey.trim() : "";
    const fields =
      body?.fields && typeof body.fields === "object" && !Array.isArray(body.fields)
        ? body.fields
        : null;

    if (!micrositeId) {
      return NextResponse.json({ error: "Missing micrositeId" }, { status: 400 });
    }

    if (!fields) {
      return NextResponse.json(
        { error: "Invalid fields payload" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: microsite, error: micrositeError } = await supabase
      .from("microsites")
      .select("id, slug, owner_email")
      .eq("id", micrositeId)
      .maybeSingle();

    if (micrositeError) {
      return NextResponse.json(
        { error: micrositeError.message || "Failed to load microsite" },
        { status: 500 },
      );
    }

    if (!microsite) {
      return NextResponse.json(
        { error: "Microsite not found" },
        { status: 404 },
      );
    }

    const resolvedPageSlug =
      pageSlug || (typeof microsite.slug === "string" ? microsite.slug : null);

    const { error: insertError } = await supabase
      .from("form_submissions")
      .insert({
        page_id: microsite.id,
        page_slug: resolvedPageSlug,
        template_key: templateKey || null,
        design_key: designKey || null,
        data: fields,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Failed to save submission" },
        { status: 500 },
      );
    }

    const ownerEmail =
      typeof microsite.owner_email === "string" ? microsite.owner_email : "";

    if (ownerEmail) {
      await sendSubmissionNotification({
        to: ownerEmail,
        micrositeId,
        pageSlug: typeof pageSlug === "string" ? pageSlug : null,
        templateKey: typeof templateKey === "string" ? templateKey : null,
        designKey: typeof designKey === "string" ? designKey : null,
        fields,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}