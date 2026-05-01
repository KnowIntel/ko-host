import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    feature: "pop_balloon",
    status: "ready",
  });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    feature: "pop_balloon",
    message: "Pop the Balloon API shell ready.",
  });
}