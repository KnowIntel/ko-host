// app/api/templates/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServerAnon } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabaseServerAnon();
  const { data, error } = await supabase
    .from("templates")
    .select("template_key,name,description,hero_icon")
    .order("name", { ascending: true });

  if (error) {
    console.error("[api/templates] error", { message: error.message });
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data ?? [], {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  });
}