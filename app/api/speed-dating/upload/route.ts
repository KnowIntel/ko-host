import { NextRequest, NextResponse } from "next/server";

import { ok, fail } from "@/lib/speed-dating/serializers";

/*
TEMP:
Return base64 data URL so image survives round-trip in local testing.
Replace later with Supabase Storage.
*/

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(fail("Missing file"), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/png";
    const base64 = buffer.toString("base64");
    const imageUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json(
      ok({
        imageUrl,
      }),
    );
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      fail("Upload failed", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}