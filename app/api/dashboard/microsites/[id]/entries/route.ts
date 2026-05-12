import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const [generalResult, threadResult] = await Promise.all([
    supabase
      .from("general_submissions")
      .select("*")
      .eq("microsite_id", id)
      .order("created_at", { ascending: false }),

    supabase
      .from("microsite_thread_messages")
      .select(
        "id, microsite_id, thread_block_id, author_name, message_text, attachments, votes, created_at",
      )
      .eq("microsite_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (generalResult.error) {
    return NextResponse.json(
      { error: generalResult.error.message },
      { status: 500 },
    );
  }

  if (threadResult.error) {
    return NextResponse.json(
      { error: threadResult.error.message },
      { status: 500 },
    );
  }

  const generalEntries = Array.isArray(generalResult.data)
    ? generalResult.data.map((entry) => ({
        ...entry,
        source: "form",
        message: entry.message ?? "",
      }))
    : [];

  const threadEntries = Array.isArray(threadResult.data)
    ? threadResult.data.map((entry) => ({
        id: `thread_${entry.id}`,
        microsite_id: entry.microsite_id,
        source: "thread",
        author_name: entry.author_name ?? "Guest",
        message: [
          `Thread message from ${entry.author_name ?? "Guest"}`,
          entry.message_text ?? "",
          Array.isArray(entry.attachments) && entry.attachments.length > 0
            ? `Media attachments: ${entry.attachments.length}`
            : "",
        ]
          .filter(Boolean)
          .join("<|>"),
        attachments: Array.isArray(entry.attachments) ? entry.attachments : [],
        created_at: entry.created_at,
      }))
    : [];

  const entries = [...generalEntries, ...threadEntries].sort((a, b) => {
    const aTime = new Date(a.created_at ?? 0).getTime();
    const bTime = new Date(b.created_at ?? 0).getTime();
    return bTime - aTime;
  });

  return NextResponse.json({ entries });
}