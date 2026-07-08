"use client";

import type { Dispatch, SetStateAction } from "react";


/**
 * Visitor Counter inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "visitor_counter"
 */

import type {
  VisitorCountStyleTarget,
  VisitorCountTextTarget,
} from "@/components/builder/formatting/visitorCountFormatting";

type VisitorCounterInspectorSectionProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  visitorCountTextTarget: VisitorCountTextTarget;
  setVisitorCountTextTarget: Dispatch<
    SetStateAction<VisitorCountTextTarget>
  >;

  visitorCountStyleTarget: VisitorCountStyleTarget;
  setVisitorCountStyleTarget: Dispatch<
    SetStateAction<VisitorCountStyleTarget>
  >;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function VisitorCounterInspector({
  selectedBlock,
  updateSelectedBlock,

  visitorCountTextTarget,
  setVisitorCountTextTarget,

  visitorCountStyleTarget,
  setVisitorCountStyleTarget,

  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: VisitorCounterInspectorSectionProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Visitor Counter */}
    <div className={inspectorLabelClass()}>Visitor Counter</div>

<div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
  <div className={inspectorLabelClass()}>Formatting</div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Text Target</div>

    <select
      value={visitorCountTextTarget}
      onChange={(e) =>
        setVisitorCountTextTarget(
          e.target.value as VisitorCountTextTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="heading">Heading</option>
      <option value="subtitle">Subtitle</option>
      <option value="counterLabel">Counter Label</option>
    </select>
  </div>

  <div className="mt-3">
    <div className={inspectorLabelClass()}>Style Target</div>

    <select
      value={visitorCountStyleTarget}
      onChange={(e) =>
        setVisitorCountStyleTarget(
          e.target.value as VisitorCountStyleTarget,
        )
      }
      className={inspectorInputClass()}
    >
      <option value="tiles">Tiles</option>
      <option value="block">Block</option>
    </select>
  </div>
</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Heading</div>
      <input
        type="text"
        value={selectedBlock.data.heading ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    heading: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showHeading !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showHeading: e.target.checked,
                  },
                },
          )
        }
      />
      Show heading
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Subtitle</div>
      <input
        type="text"
        value={selectedBlock.data.subtitle ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    subtitle: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showSubtitle === true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showSubtitle: e.target.checked,
                  },
                },
          )
        }
      />
      Show subtitle
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Counter Label</div>
      <input
        type="text"
        value={selectedBlock.data.label ?? ""}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    label: e.target.value,
                  },
                },
          )
        }
        className={inspectorInputClass()}
      />
    </div>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showLabel !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showLabel: e.target.checked,
                  },
                },
          )
        }
      />
      Show label
    </label>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showIcon !== false}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showIcon: e.target.checked,
                  },
                },
          )
        }
      />
      Show icon
    </label>

    <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
      <input
        type="checkbox"
        checked={selectedBlock.data.showLastUpdated === true}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    showLastUpdated: e.target.checked,
                  },
                },
          )
        }
      />
      Show last updated
    </label>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Style Variant</div>
      <select
        value={selectedBlock.data.variant ?? "flip"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    variant: e.target.value as "flip" | "dial" | "smooth_count",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="flip">Flip</option>
        <option value="dial">Dial</option>
        <option value="smooth_count">Smooth Count</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Alignment</div>
      <select
        value={selectedBlock.data.alignment ?? "center"}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    alignment: e.target.value as "left" | "center" | "right",
                  },
                },
          )
        }
        className={inspectorInputClass()}
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Animation Delay</div>
      <input
        type="range"
        min={0}
        max={3000}
        step={100}
        value={selectedBlock.data.animationDelayMs ?? 1500}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    animationDelayMs: Number(e.target.value) || 0,
                  },
                },
          )
        }
        className="w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {selectedBlock.data.animationDelayMs ?? 1500}ms
      </div>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Animation Duration</div>
      <input
        type="range"
        min={200}
        max={2000}
        step={100}
        value={selectedBlock.data.animationDurationMs ?? 800}
        onChange={(e) =>
          updateSelectedBlock((block: any) =>
            block.type !== "visitor_counter"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    animationDurationMs: Number(e.target.value) || 800,
                  },
                },
          )
        }
        className="w-full"
      />
      <div className="mt-1 text-xs text-neutral-500">
        {selectedBlock.data.animationDurationMs ?? 800}ms
      </div>
    </div>

    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
      This block is using a temporary preview count for now. Live visit analytics will be connected next.
    </div>
    </div>
  );
}
