// components\live\useLiveEndpoint.ts


"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

const ACTIVITY_ENDPOINT_TYPES: Record<string, string> = {
  "spin-wheel": "spin_wheel",
  lottery: "lottery",
  "mystery-drop": "mystery_drop",
  "scavenger-hunt": "scavenger_hunt",
  trivia: "trivia",
  poll: "poll",
};

export function useLiveEndpoint<T>(
  endpoint: string,
  enabled = true,
) {
  const {
    experience,
    authenticated,
    realtimeRevision,
    allowMultipleActiveActivities,
    activeActivities,
    selectedActivityId,
  } = useLiveRuntime();

  const [data, setData] =
    useState<T | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const requestSequence = useRef(0);

  const experienceId =
    experience?.id ?? null;

  const activityType =
    ACTIVITY_ENDPOINT_TYPES[endpoint] ?? null;

  const activityId = useMemo(() => {
    if (
      !allowMultipleActiveActivities ||
      !activityType
    ) {
      return null;
    }

    const selectedActivity = activeActivities.find(
      (activity) =>
        activity.id === selectedActivityId &&
        activity.activityType === activityType,
    );

    return selectedActivity?.id ?? null;
  }, [
    allowMultipleActiveActivities,
    activityType,
    activeActivities,
    selectedActivityId,
  ]);

  const requiresSelectedActivity =
    allowMultipleActiveActivities &&
    Boolean(activityType);

  const refresh = useCallback(
    async () => {
      const sequence = ++requestSequence.current;

      if (
        !enabled ||
        !authenticated ||
        !experienceId ||
        (requiresSelectedActivity && !activityId)
      ) {
        setData(null);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (requiresSelectedActivity && activityId) {
          params.set("activityId", activityId);
        }

        const query = params.toString();

        const response = await fetch(
          `/api/live/${encodeURIComponent(
            experienceId,
          )}/${endpoint}${query ? `?${query}` : ""}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const payload = await response
          .json()
          .catch(() => null);

        if (sequence !== requestSequence.current) {
          return;
        }

        if (
          !response.ok ||
          payload?.ok !== true
        ) {
          setData(null);

          setError(
            typeof payload?.error === "string"
              ? payload.error
              : "Unable to load Live data.",
          );

          return;
        }

        setData(payload as T);
        setError("");
      } catch (fetchError) {
        if (sequence !== requestSequence.current) {
          return;
        }

        console.error(
          `Live ${endpoint} load failed:`,
          fetchError,
        );

        setData(null);
        setError("Unable to load Live data.");
      } finally {
        if (sequence === requestSequence.current) {
          setLoading(false);
        }
      }
    },
    [
      authenticated,
      enabled,
      endpoint,
      experienceId,
      requiresSelectedActivity,
      activityId,
    ],
  );

  useEffect(() => {
    setData(null);
    setError("");

    void refresh();

    return () => {
      requestSequence.current += 1;
    };
  }, [
    refresh,
    realtimeRevision,
  ]);

  return {
    data,
    loading,
    error,
    refresh,
    experienceId,
    authenticated,
    activityId,
  };
}
