import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {

  const body = await req.json();

  const { microsite_slug, name, message } = body;

  const { error } = await supabase
    .from("microsite_messages")
    .insert({
      microsite_slug,
      name,
      message,
    });

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ success: true });
}