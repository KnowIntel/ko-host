import { NextResponse } from "next/server";

type PuzzlePosition = {
  x: number;
  y: number;
  updatedAt: number;
  updatedBy: string;
};

type PuzzleRoom = {
  positions: Record<string, PuzzlePosition>;
  completedPieces: Record<string, boolean>;
  updatedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __KOHOST_PUZZLE_STORE__: Record<string, PuzzleRoom> | undefined;
}

function getStore() {
  if (!globalThis.__KOHOST_PUZZLE_STORE__) {
    globalThis.__KOHOST_PUZZLE_STORE__ = {};
  }

  return globalThis.__KOHOST_PUZZLE_STORE__;
}

function getRoom(roomId: string) {
  const store = getStore();

  if (!store[roomId]) {
    store[roomId] = {
      positions: {},
      completedPieces: {},
      updatedAt: Date.now(),
    };
  }

  return store[roomId];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId") || "default";

    const room = getRoom(roomId);

    return NextResponse.json({
      ok: true,
      roomId,
      positions: room.positions,
      completedPieces: room.completedPieces,
      updatedAt: room.updatedAt,
    });
  } catch (error) {
    console.error("PUZZLE_STATE_GET_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown puzzle GET error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId") || "default";

    const body = await req.json();
    const room = getRoom(roomId);
    const now = Date.now();

    if (body.action === "move") {
      const pieceId = String(body.pieceId || "");
      const userId = String(body.userId || "anonymous");

      if (!pieceId) {
        return NextResponse.json(
          { ok: false, error: "pieceId required" },
          { status: 400 },
        );
      }

      room.positions[pieceId] = {
        x: Number(body.x) || 0,
        y: Number(body.y) || 0,
        updatedAt: now,
        updatedBy: userId,
      };

      if (typeof body.isPlaced === "boolean") {
        room.completedPieces[pieceId] = body.isPlaced;
      }

      room.updatedAt = now;

      return NextResponse.json({
        ok: true,
        state: room,
      });
    }

    if (body.action === "reset") {
      room.positions = {};
      room.completedPieces = {};
      room.updatedAt = now;

      return NextResponse.json({
        ok: true,
        state: room,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("PUZZLE_STATE_POST_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unknown puzzle POST error",
      },
      { status: 500 },
    );
  }
}