// app/api/connect/services/route.ts

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("connect_services")
      .select("id, slug, name")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unable to load Ko-Host Connect services.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      services: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected service loading error.",
      },
      { status: 500 },
    );
  }
}