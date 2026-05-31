import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Microsite creation route is not implemented yet." },
    { status: 501 },
  );
}