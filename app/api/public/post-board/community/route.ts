import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function makeClientId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const micrositeId = searchParams.get("micrositeId")?.trim() || "";
    const blockId = searchParams.get("blockId")?.trim() || "";

    if (!micrositeId) return badRequest("Missing micrositeId.");
    if (!blockId) return badRequest("Missing blockId.");

    const supabaseAdmin = getSupabaseAdmin();

    const { data: posts, error: postsError } = await supabaseAdmin
      .from("post_board_posts")
      .select("*")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .order("created_at", { ascending: false });

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    const { data: replies, error: repliesError } = await supabaseAdmin
      .from("post_board_replies")
      .select("*")
      .eq("microsite_id", micrositeId)
      .eq("block_id", blockId)
      .order("created_at", { ascending: true });

    if (repliesError) {
      return NextResponse.json({ error: repliesError.message }, { status: 500 });
    }

    return NextResponse.json({
      posts: posts ?? [],
      replies: replies ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load community board." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action = typeof body?.action === "string" ? body.action : "";
    const micrositeId =
      typeof body?.micrositeId === "string" ? body.micrositeId.trim() : "";
    const blockId =
      typeof body?.blockId === "string" ? body.blockId.trim() : "";

    if (!micrositeId) return badRequest("Missing micrositeId.");
    if (!blockId) return badRequest("Missing blockId.");

    const supabaseAdmin = getSupabaseAdmin();

    if (action === "create_post") {
      const postId =
        typeof body?.postId === "string" && body.postId.trim()
          ? body.postId.trim()
          : makeClientId("community_post");

      const authorName =
        typeof body?.authorName === "string" ? body.authorName.trim() : "";
      const authorEmail =
        typeof body?.authorEmail === "string" ? body.authorEmail.trim() : "";
      const authorAvatarUrl =
        typeof body?.authorAvatarUrl === "string"
          ? body.authorAvatarUrl.trim()
          : "";
      const title = typeof body?.title === "string" ? body.title.trim() : "";
const message =
  typeof body?.message === "string" ? body.message.trim() : "";

      if (!authorName) return badRequest("Name is required.");
      if (!title) return badRequest("Title is required.");
      if (!message) return badRequest("Message is required.");

      const { data, error } = await supabaseAdmin
        .from("post_board_posts")
        .insert({
          microsite_id: micrositeId,
          block_id: blockId,
          post_id: postId,
          author_name: authorName,
          author_email: authorEmail || null,
          author_avatar_url: authorAvatarUrl || null,
          title,
          message,
          contact_info_confirmed: Boolean(authorEmail),
        })
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ post: data });
    }

    if (action === "create_reply") {
      const replyId =
        typeof body?.replyId === "string" && body.replyId.trim()
          ? body.replyId.trim()
          : makeClientId("reply");

      const postId =
        typeof body?.postId === "string" ? body.postId.trim() : "";
      const sourcePostTitle =
        typeof body?.sourcePostTitle === "string"
          ? body.sourcePostTitle.trim()
          : "Untitled post";
      const authorName =
        typeof body?.authorName === "string" ? body.authorName.trim() : "";
      const authorEmail =
        typeof body?.authorEmail === "string" ? body.authorEmail.trim() : "";
      const authorAvatarUrl =
        typeof body?.authorAvatarUrl === "string"
          ? body.authorAvatarUrl.trim()
          : "";
const message =
  typeof body?.message === "string" ? body.message.trim() : "";

const sourcePostAuthorEmail =
  typeof body?.sourcePostAuthorEmail === "string"
    ? body.sourcePostAuthorEmail.trim()
    : "";

const shouldNotifyPostAuthor = Boolean(body?.shouldNotifyPostAuthor);

      if (!postId) return badRequest("Missing postId.");
      if (!authorName) return badRequest("Name is required.");
      if (!message) return badRequest("Message is required.");

      const { data, error } = await supabaseAdmin
        .from("post_board_replies")
        .insert({
          microsite_id: micrositeId,
          block_id: blockId,
          reply_id: replyId,
          post_id: postId,
          source_post_title: sourcePostTitle,
          author_name: authorName,
          author_email: authorEmail || null,
          author_avatar_url: authorAvatarUrl || null,
          message,
          contact_info_confirmed: Boolean(authorEmail),
        })
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

await supabaseAdmin
  .from("post_board_posts")
  .update({
    updated_at: new Date().toISOString(),
  })
  .eq("microsite_id", micrositeId)
  .eq("block_id", blockId)
  .eq("post_id", postId);

let notifiedPostAuthor = false;

if (shouldNotifyPostAuthor && sourcePostAuthorEmail && process.env.RESEND_API_KEY) {
  const emailResult = await resend.emails.send({
    from: "Ko-Host <support@ko-host.com>",
    to: [sourcePostAuthorEmail],
    replyTo: authorEmail || undefined,
    subject: `New reply to your discussion: ${sourcePostTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New reply to your Ko-Host discussion</h2>

        <p>
          <strong>Discussion:</strong>
          ${escapeHtml(sourcePostTitle)}
        </p>

        <p>
          <strong>Reply from:</strong>
          ${escapeHtml(authorName)}
        </p>

        ${
          authorEmail
            ? `<p><strong>Reply contact:</strong> ${escapeHtml(authorEmail)}</p>`
            : `<p><strong>Reply contact:</strong> Not provided</p>`
        }

        <p><strong>Message:</strong></p>

        <div style="white-space: pre-wrap; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px;">
          ${escapeHtml(message)}
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
          This email was sent because someone replied to a public Community Board discussion you started on Ko-Host.
          Your email address was not displayed publicly.
        </p>
      </div>
    `,
  });

  if (!emailResult.error) {
    notifiedPostAuthor = true;
  }
}

return NextResponse.json({
  reply: data,
  notifiedPostAuthor,
});
    }

    return badRequest("Invalid action.");
  } catch {
    return NextResponse.json(
      { error: "Failed to update community board." },
      { status: 500 },
    );
  }
}