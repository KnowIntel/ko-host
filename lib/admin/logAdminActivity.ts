import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function logAdminActivity({
  adminEmail,
  action,
  targetType,
  targetId,
  metadata,
}: {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();

  await supabase.from("admin_activity_log").insert({
    admin_email: adminEmail,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata: metadata ?? null,
  });
}