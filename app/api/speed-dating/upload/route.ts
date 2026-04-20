import { NextRequest, NextResponse } from "next/server";

import { ok, fail } from "@/lib/speed-dating/serializers";

/*
TEMP: stub upload
Replace later with Supabase Storage
*/

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(fail("Missing file"), { status: 400 });
    }

    // TEMP fake URL
    const fakeUrl = URL.createObjectURL(file);

    return NextResponse.json(
      ok({
        imageUrl: fakeUrl,
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