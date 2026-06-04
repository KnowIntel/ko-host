 import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    return NextResponse.json({
      ok: true,
      message: "Audio upload route active.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Audio upload failed.",
      },
      { status: 500 },
    );
  }
}