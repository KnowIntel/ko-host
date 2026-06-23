"use client";

type SpeedDatingInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function SpeedDatingInspector({
  selectedBlock,
  updateSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: SpeedDatingInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>Speed Dating</div>

      <div className="mt-4">
        <div className={inspectorLabelClass()}>Heading</div>

        <input
          type="text"
          value={selectedBlock.data.heading ?? ""}
          onChange={(e) =>
            updateSelectedBlock((block: any) =>
              block.type !== "speed_dating"
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

      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Round Start Sound
        </div>

        <div className="mt-2 flex items-center gap-2">
          <select
            value={selectedBlock.data.roundStartSound ?? "spark"}
            onChange={(e) =>
              updateSelectedBlock((block: any) =>
                block.type !== "speed_dating"
                  ? block
                  : {
                      ...block,
                      data: {
                        ...block.data,
                        roundStartSound: e.target.value as
                          | "none"
                          | "arrival"
                          | "spark"
                          | "commence"
                          | "cloak"
                          | "vanish",
                      },
                    },
              )
            }
            className={`${inspectorInputClass()} mt-0 flex-1`}
          >
            <option value="none">[no sound]</option>
            <option value="arrival">arrival</option>
            <option value="spark">spark</option>
            <option value="commence">commence</option>
            <option value="cloak">cloak</option>
            <option value="vanish">vanish</option>
          </select>

          <button
            type="button"
            onClick={() => {
              const selectedSound =
                selectedBlock.data.roundStartSound ?? "spark";

              const soundMap = {
                arrival: "/sounds/sfx_checkin.mp3",
                spark: "/sounds/sfx_chime.mp3",
                commence: "/sounds/sfx_gong.mp3",
                cloak: "/sounds/sfx_summon.mp3",
                vanish: "/sounds/sfx_vanish.mp3",
              } as const;

              if (selectedSound === "none") return;

const src =
  selectedSound === "arrival"
    ? soundMap.arrival
    : selectedSound === "spark"
      ? soundMap.spark
      : selectedSound === "commence"
        ? soundMap.commence
        : selectedSound === "cloak"
          ? soundMap.cloak
          : selectedSound === "vanish"
            ? soundMap.vanish
            : soundMap.spark;

              const audio = new Audio(src);

              void audio.play().catch(() => {});
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
            title="Test sound"
            aria-label="Test sound"
          >
            <img
              src="/icons/icon_play_sound.webp"
              alt="Play sound"
              className="h-5 w-5 object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  );
}