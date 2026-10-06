"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useLiveRuntime } from "@/components/live/LiveRuntimeContext";

export function useLiveEndpoint<T>(
  endpoint: string,
  enabled = true,
) {
  const {
    experience,
    authenticated,
    realtimeRevision,
  } = useLiveRuntime();

  const [data, setData] =
    useState<T | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const experienceId =
    experience?.id ?? null;

  const refresh = useCallback(
    async () => {
      if (
        !enabled ||
        !authenticated ||
        !experienceId
      ) {
        setData(null);
        setError("");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/live/${encodeURIComponent(
            experienceId,
          )}/${endpoint}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const payload =
          await response
            .json()
            .catch(() => null);

        if (
          !response.ok ||
          payload?.ok !== true
        ) {
          setData(null);

          setError(
            typeof payload?.error ===
              "string"
              ? payload.error
              : "Unable to load Live data.",
          );

          return;
        }

        setData(payload as T);
        setError("");
      } catch (fetchError) {
        console.error(
          `Live ${endpoint} load failed:`,
          fetchError,
        );

        setData(null);
        setError(
          "Unable to load Live data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      authenticated,
      enabled,
      endpoint,
      experienceId,
    ],
  );

  useEffect(() => {
    void refresh();
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
  };
}