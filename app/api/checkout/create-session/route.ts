import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const blockId =
    body && typeof body === "object" && typeof body.blockId === "string"
      ? body.blockId
      : null;

  const micrositeId =
    body && typeof body === "object" && typeof body.micrositeId === "string"
      ? body.micrositeId
      : null;

  if (!blockId) {
    return NextResponse.json(
      { error: "Missing blockId" },
      { status: 400 },
    );
  }

  if (!micrositeId) {
    return NextResponse.json(
      { error: "Checkout only works on a live microsite right now." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { error: "Stripe not connected" },
    { status: 400 },
  );
}