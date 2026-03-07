import { PRESETS } from "./presetRegistry";
import { getPreset } from "./presetUtils";

export function createDraftFromPreset(designKey?: string) {
  const preset = getPreset(designKey);

  return {
    designKey: preset,
  };
}