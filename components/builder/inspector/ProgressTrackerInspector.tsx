"use client";

import type {
  ProgressTrackerBlock,
  MicrositeBlock,
} from "@/lib/templates/builder";

type Props = {
  block: ProgressTrackerBlock;
  updateSelectedBlock: (
  updater: (block: MicrositeBlock) => MicrositeBlock
) => void;
};

export function ProgressTrackerInspector({
  block,
  updateSelectedBlock,
}: Props) {
  const updateData = (patch: Partial<ProgressTrackerBlock["data"]>) => {
    updateSelectedBlock((current) => {
      if (current.type !== "progress_tracker") return current;

      return {
        ...current,
        data: {
          ...current.data,
          ...patch,
        },
      };
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Tracker Title
        </label>
        <input
          type="text"
          value={block.data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Show History
        </label>
        <input
          type="checkbox"
          checked={block.data.showHistory}
          onChange={(e) => updateData({ showHistory: e.target.checked })}
        />
      </div>
    </div>
  );
}