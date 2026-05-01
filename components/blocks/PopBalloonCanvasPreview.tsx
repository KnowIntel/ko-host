import type { PopBalloonBlock } from "@/lib/templates/builder";

type Props = {
  block: PopBalloonBlock;
};

export default function PopBalloonCanvasPreview({ block }: Props) {
  const data = block.data;
  const lineupSlots = Math.max(2, Math.min(12, data.lineupSlots ?? 6));

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-red-200 bg-white p-4 text-neutral-900">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
        {data.hostName || "Host"}
      </div>

      <div className="mt-1 text-2xl font-bold">
        {data.title || "Pop the Balloon"}
      </div>

      <div className="mt-2 text-sm text-neutral-600">
        {data.prompt || "Introduce yourself and decide who keeps their balloon."}
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Featured Contestant
        </div>
        <div className="mt-2 text-lg font-semibold">Contestant Card</div>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-3 gap-3 overflow-hidden">
        {Array.from({ length: lineupSlots }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-2"
          >
            <div className="text-4xl leading-none">🎈</div>
            <div className="mt-1 text-xs font-medium text-neutral-700">
              Player {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}