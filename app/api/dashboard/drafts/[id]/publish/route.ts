import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Drafts should go to Publish Setup, not publish live from this route.",
    },
    { status: 405 },
  );
}