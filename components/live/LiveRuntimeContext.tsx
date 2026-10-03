"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LiveExperienceContext = {
  id: string;
  micrositeId: string;
  name: string;
  status:
    | "before"
    | "live"
    | "paused"
    | "ended"
    | "after";
  isEnabled: boolean;
  startedAt: string | null;
  endedAt: string | null;
};

export type LiveParticipant = {
  id: string;
  experienceId: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
  joinedAt: string;
};

export type LiveSharedState = {
  currentActivityType: string | null;
  currentActivityId: string | null;
  state: Record<string, unknown>;
  updatedAt: string | null;
};

type LiveRuntimeValue = {
  experience: LiveExperienceContext | null;

  participant: LiveParticipant | null;
  authenticated: boolean;

  sharedState: LiveSharedState | null;

  loading: boolean;
  sessionLoading: boolean;
  stateLoading: boolean;
  joining: boolean;
  leaving: boolean;

  joinError: string | null;

  joinExperience: (
    displayName: string,
  ) => Promise<boolean>;

  leaveExperience: () => Promise<boolean>;

  refreshSession: () => Promise<void>;
  refreshSharedState: () => Promise<void>;
};

const LiveRuntimeContext =
  createContext<LiveRuntimeValue | null>(null);

type LiveRuntimeProviderProps = {
  liveExperience?: LiveExperienceContext | null;
  children: ReactNode;
};

export function LiveRuntimeProvider({
  liveExperience = null,
  children,
}: LiveRuntimeProviderProps) {
  const [participant, setParticipant] =
    useState<LiveParticipant | null>(null);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [sharedState, setSharedState] =
    useState<LiveSharedState | null>(null);

  const [sessionLoading, setSessionLoading] =
    useState(Boolean(liveExperience));

  const [stateLoading, setStateLoading] =
    useState(Boolean(liveExperience));

  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [joinError, setJoinError] =
    useState<string | null>(null);

  const refreshSession = useCallback(
    async () => {
      if (!liveExperience?.id) {
        setParticipant(null);
        setAuthenticated(false);
        setSessionLoading(false);
        return;
      }

      setSessionLoading(true);

      try {
        const response = await fetch(
          `/api/live/${encodeURIComponent(
            liveExperience.id,
          )}/session`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const payload =
          await response.json().catch(() => null);

        if (
          response.ok &&
          payload?.ok === true &&
          payload?.authenticated === true &&
          payload?.participant
        ) {
          setParticipant(
            payload.participant as LiveParticipant,
          );
          setAuthenticated(true);
        } else {
          setParticipant(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Live participant session load failed:",
          error,
        );

        setParticipant(null);
        setAuthenticated(false);
      } finally {
        setSessionLoading(false);
      }
    },
    [liveExperience?.id],
  );

  const refreshSharedState = useCallback(
    async () => {
      if (!liveExperience?.id) {
        setSharedState(null);
        setStateLoading(false);
        return;
      }

      setStateLoading(true);

      try {
        const response = await fetch(
          `/api/live/${encodeURIComponent(
            liveExperience.id,
          )}/state`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const payload =
          await response.json().catch(() => null);

        if (
          response.ok &&
          payload?.ok === true &&
          payload?.sharedState
        ) {
          setSharedState(
            payload.sharedState as LiveSharedState,
          );
        } else {
          setSharedState(null);
        }
      } catch (error) {
        console.error(
          "Live shared state load failed:",
          error,
        );

        setSharedState(null);
      } finally {
        setStateLoading(false);
      }
    },
    [liveExperience?.id],
  );

  const joinExperience = useCallback(
    async (
      displayName: string,
    ): Promise<boolean> => {
      if (!liveExperience?.id) {
        setJoinError(
          "This Live experience is not available.",
        );
        return false;
      }

      const safeDisplayName = String(
        displayName || "",
      ).trim();

      if (!safeDisplayName) {
        setJoinError("Enter a display name.");
        return false;
      }

      setJoining(true);
      setJoinError(null);

      try {
        const response = await fetch(
          `/api/live/${encodeURIComponent(
            liveExperience.id,
          )}/join`,
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              displayName: safeDisplayName,
            }),
          },
        );

        const payload =
          await response.json().catch(() => null);

        if (
          !response.ok ||
          payload?.ok !== true ||
          !payload?.participant
        ) {
          setJoinError(
            typeof payload?.error === "string"
              ? payload.error
              : "Unable to join this Live experience.",
          );

          return false;
        }

        setParticipant(
          payload.participant as LiveParticipant,
        );

        setAuthenticated(true);

        return true;
      } catch (error) {
        console.error(
          "Live participant join failed:",
          error,
        );

        setJoinError(
          "Unable to join this Live experience.",
        );

        return false;
      } finally {
        setJoining(false);
      }
    },
    [liveExperience?.id],
  );

  const leaveExperience = useCallback(
    async (): Promise<boolean> => {
      if (!liveExperience?.id) {
        setParticipant(null);
        setAuthenticated(false);
        return true;
      }

      setLeaving(true);

      try {
        const response = await fetch(
          `/api/live/${encodeURIComponent(
            liveExperience.id,
          )}/session/leave`,
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          },
        );

        const payload =
          await response.json().catch(() => null);

        if (
          !response.ok ||
          payload?.ok !== true
        ) {
          return false;
        }

        setParticipant(null);
        setAuthenticated(false);
        setJoinError(null);

        return true;
      } catch (error) {
        console.error(
          "Live participant leave failed:",
          error,
        );

        return false;
      } finally {
        setLeaving(false);
      }
    },
    [liveExperience?.id],
  );

  useEffect(() => {
    void refreshSession();
    void refreshSharedState();
  }, [
    refreshSession,
    refreshSharedState,
  ]);

  const value = useMemo<LiveRuntimeValue>(
    () => ({
      experience: liveExperience,

      participant,
      authenticated,

      sharedState,

      loading:
        sessionLoading ||
        stateLoading,

      sessionLoading,
      stateLoading,
      joining,
      leaving,

      joinError,

      joinExperience,
      leaveExperience,

      refreshSession,
      refreshSharedState,
    }),
    [
      liveExperience,
      participant,
      authenticated,
      sharedState,
      sessionLoading,
      stateLoading,
      joining,
      leaving,
      joinError,
      joinExperience,
      leaveExperience,
      refreshSession,
      refreshSharedState,
    ],
  );

  return (
    <LiveRuntimeContext.Provider value={value}>
      {children}
    </LiveRuntimeContext.Provider>
  );
}

export function useLiveRuntime() {
  const context = useContext(LiveRuntimeContext);

  if (!context) {
    throw new Error(
      "useLiveRuntime must be used within a LiveRuntimeProvider.",
    );
  }

  return context;
}