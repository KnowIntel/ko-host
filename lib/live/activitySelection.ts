// lib\live\activitySelection.ts

export type LiveActivitySelection = {
  allowMultipleActiveActivities: boolean;
  activeActivityIds: string[];
};

export function readLiveActivitySelection(
  value: unknown,
): LiveActivitySelection {
  const state =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const allowMultipleActiveActivities =
    state.allowMultipleActiveActivities === true;

  const activeActivityIds = Array.isArray(
    state.activeActivityIds,
  )
    ? [
        ...new Set(
          state.activeActivityIds.filter(
            (id): id is string =>
              typeof id === "string" &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                id,
              ),
          ),
        ),
      ]
    : [];

  return {
    allowMultipleActiveActivities,
    activeActivityIds,
  };
}

export function isLiveActivitySelected(
  activityId: string,
  currentActivityId: string | null,
  selection: LiveActivitySelection,
): boolean {
  if (!selection.allowMultipleActiveActivities) {
    return activityId === currentActivityId;
  }

  return selection.activeActivityIds.includes(
    activityId,
  );
} 