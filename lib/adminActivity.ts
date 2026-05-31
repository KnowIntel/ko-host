import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type AdminActivityInput = {
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
};

export async function logAdminActivity({
  adminEmail,
  action,
  targetType,
  targetId,
  details,
}: AdminActivityInput) {
  const supabase = getSupabaseAdmin();

  await supabase.from("admin_activity_log").insert({
    admin_email: adminEmail,
    action,
    target_type: targetType || null,
    target_id: targetId || null,
    details: details || null,
  });
}