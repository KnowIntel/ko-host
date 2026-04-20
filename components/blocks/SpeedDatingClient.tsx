

"use client";

import SpeedDatingLive from "@/components/blocks/SpeedDatingLive";

type SpeedDatingBlock = {
  type: "speed_dating";
  data: {
    heading?: string;
    roundDurationSeconds?: number;
    showTimer?: boolean;
    leftLabel?: string;
    rightLabel?: string;
  };
};

type Props = {
  block: SpeedDatingBlock;
};

export default function SpeedDatingClient({ block }: Props) {
  return (
    <SpeedDatingLive
      heading={block.data.heading}
      roundDurationSeconds={block.data.roundDurationSeconds ?? 120}
      showTimer={block.data.showTimer !== false}
      leftLabel={block.data.leftLabel}
      rightLabel={block.data.rightLabel}
    />
  );
}