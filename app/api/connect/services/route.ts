import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type ConnectServiceRow = {
  id: string;
  slug: string;
  name: string;
  search_tags: string[] | null;
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("connect_services")
      .select(
        [
          "id",
          "slug",
          "name",
          "search_tags",
        ].join(","),
      )
      .eq("active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Ko-Host Connect services load failed:",
        error,
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load Ko-Host Connect services.",
        },
        { status: 500 },
      );
    }

    const services = (
      (data ?? []) as unknown as ConnectServiceRow[]
    ).map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      search_tags: Array.isArray(
        service.search_tags,
      )
        ? service.search_tags
        : [],
    }));

    return NextResponse.json({
      ok: true,
      services,
    });
  } catch (error) {
    console.error(
      "Unexpected Connect service loading error:",
      error,
    );

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