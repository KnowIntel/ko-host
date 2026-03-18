import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSubmissionNotification } from "@/lib/forms/sendSubmissionNotification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pageId,
      pageSlug,
      templateKey,
      designKey,
      fields,
    } = body ?? {};

    if (!pageId || typeof pageId !== "string") {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid fields payload" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from("form_submissions").insert({
      page_id: pageId,
      page_slug: typeof pageSlug === "string" ? pageSlug : null,
      template_key: typeof templateKey === "string" ? templateKey : null,
      design_key: typeof designKey === "string" ? designKey : null,
      data: fields,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

            const microsite =
      typeof pageSlug === "string" && pageSlug
        ? await supabase
            .from("microsites")
            .select("owner_email")
            .eq("slug", pageSlug)
            .maybeSingle()
        : { data: null };

    const ownerEmail = microsite?.data?.owner_email;

    if (ownerEmail) {
      await sendSubmissionNotification({
        to: ownerEmail,
        pageId,
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