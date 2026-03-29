import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const micrositeId =
      typeof searchParams.get("micrositeId") === "string"
        ? searchParams.get("micrositeId")!.trim()
        : "";

const mode =
  typeof searchParams.get("mode") === "string"
    ? searchParams.get("mode")!.trim()
    : "rsvp_count";

const sourceFormBlockId =
  typeof searchParams.get("sourceFormBlockId") === "string"
    ? searchParams.get("sourceFormBlockId")!.trim()
    : "";

    if (!micrositeId) {
      return NextResponse.json(
        { error: "Missing micrositeId" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

 if (mode === "rsvp_count") {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("data")
    .eq("page_id", micrositeId);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load RSVP count" },
      { status: 500 },
    );
  }

  const count = Array.isArray(data)
    ? data.reduce((sum, row) => {
        const submissionData =
          row &&
          typeof row === "object" &&
          "data" in row &&
          row.data &&
          typeof row.data === "object" &&
          !Array.isArray(row.data)
            ? (row.data as Record<string, unknown>)
            : null;

        if (!submissionData) return sum;

        if (!sourceFormBlockId) {
          return sum + 1;
        }

        const hasMatchingField = Object.values(submissionData).some((entry) => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return false;
          }

          const candidate = entry as Record<string, unknown>;
          return candidate.formBlockId === sourceFormBlockId;
        });

        return hasMatchingField ? sum + 1 : sum;
      }, 0)
    : 0;

  return NextResponse.json({
    success: true,
    mode: "rsvp_count",
    count,
  });
}

if (mode === "total_funds") {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("data")
    .eq("page_id", micrositeId);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load total funds" },
      { status: 500 },
    );
  }

const total = Array.isArray(data)
  ? data.reduce<number>((sum, row) => {
        const submissionData =
          row &&
          typeof row === "object" &&
          "data" in row &&
          row.data &&
          typeof row.data === "object" &&
          !Array.isArray(row.data)
            ? (row.data as Record<string, unknown>)
            : null;

        if (!submissionData) return sum;

        const matchingEntries = Object.values(submissionData).filter((entry) => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return false;
          }

          const candidate = entry as Record<string, unknown>;

          if (sourceFormBlockId && candidate.formBlockId !== sourceFormBlockId) {
            return false;
          }

          return true;
        });

const entryTotal = matchingEntries.reduce<number>((entrySum, entry) => {
  const candidate = entry as Record<string, unknown>;
  const raw = candidate.value;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return entrySum + raw;
  }

  if (typeof raw === "string") {
    const parsed = Number(raw.replace(/[^0-9.\-]+/g, "").trim());
    return Number.isFinite(parsed) ? entrySum + parsed : entrySum;
  }

  return entrySum;
}, 0);

        return sum + entryTotal;
      }, 0)
    : 0;

  return NextResponse.json({
    success: true,
    mode: "total_funds",
    total,
  });
}

return NextResponse.json(
  { error: "Unsupported stats mode" },
  { status: 400 },
);
  } catch {
    return NextResponse.json(
      { error: "Failed to load form stats" },
      { status: 500 },
    );
  }
}