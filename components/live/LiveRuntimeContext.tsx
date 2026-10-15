// components\live\LiveRuntimeContext.tsx

"use client";

import { supabase } from "@/lib/supabaseClient";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LiveExperienceStatus =
  | "before"
  | "live"
  | "paused"
  | "ended"
  | "after";

export type LiveExperienceContext = {
  id: string;
  micrositeId: string;
  name: string;
  status: LiveExperienceStatus;
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

export type LiveActiveActivity = {
  id: string;
  activityType: string;
  name: string;
};

type LiveRuntimeValue = {
  experience: LiveExperienceContext | null;

  participant: LiveParticipant | null;
  authenticated: boolean;

  sharedState: LiveSharedState | null;

  allowMultipleActiveActivities: boolean;
  activeActivityIds: string[];
  activeActivities: LiveActiveActivity[];

  selectedActivityId: string | null;
  selectActivity: (activityId: string) => void;

  /*
   * Increments whenever the runtime receives a
   * Live Broadcast notification.
   *
   * Activity components can use this value to
   * refetch their authoritative server data even
   * when shared Live state itself did not change.
   */
  realtimeRevision: number;

  loading: boolean;
  sessionLoading: boolean;
  stateLoading: boolean;
  joining: boolean;
  leaving: boolean;

  joinError: string | null;

joinExperience: (
  displayName: string,
  avatarUrl?: string | null,
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

function isLiveExperienceStatus(
  value: unknown,
): value is LiveExperienceStatus {
  return (
    value === "before" ||
    value === "live" ||
    value === "paused" ||
    value === "ended" ||
    value === "after"
  );
}

export function LiveRuntimeProvider({
  liveExperience = null,
  children,
}: LiveRuntimeProviderProps) {
  /*
   * Keep a runtime copy of the experience.
   *
   * The initial value comes from the
   * server-rendered microsite, but the status can
   * change while the participant remains on the
   * page.
   */
  const [
    runtimeExperience,
    setRuntimeExperience,
  ] =
    useState<LiveExperienceContext | null>(
      liveExperience,
    );

  const [participant, setParticipant] =
    useState<LiveParticipant | null>(null);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [sharedState, setSharedState] =
    useState<LiveSharedState | null>(null);

  const [
    allowMultipleActiveActivities,
    setAllowMultipleActiveActivities,
  ] = useState(false);

  const [
    activeActivities,
    setActiveActivities,
  ] = useState<LiveActiveActivity[]>([]);

  const [
    selectedActivityId,
    setSelectedActivityId,
  ] = useState<string | null>(null);

  const activeActivityIds = useMemo(
    () => activeActivities.map((activity) => activity.id),
    [activeActivities],
  );

  const selectActivity = useCallback(
    (activityId: string) => {
      if (
        !allowMultipleActiveActivities ||
        !activeActivityIds.includes(activityId)
      ) {
        return;
      }

      setSelectedActivityId(activityId);
    },
    [
      allowMultipleActiveActivities,
      activeActivityIds,
    ],
  );

  /*
   * Changes for every realtime Broadcast,
   * including activity events that do not modify
   * live_experience_state.updated_at.
   */
  const [
    realtimeRevision,
    setRealtimeRevision,
  ] = useState(0);

  const [
    sessionLoading,
    setSessionLoading,
  ] = useState(Boolean(liveExperience));

  const [
    stateLoading,
    setStateLoading,
  ] = useState(Boolean(liveExperience));

  const [joining, setJoining] =
    useState(false);

  const [leaving, setLeaving] =
    useState(false);

  const [joinError, setJoinError] =
    useState<string | null>(null);

  /*
   * If the page itself supplies a different
   * experience, reset the runtime copy to that
   * experience.
   */
  useEffect(() => {
    setRuntimeExperience(liveExperience);
  }, [liveExperience]);

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

        const payload = await response
          .json()
          .catch(() => null);

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
        setRuntimeExperience(null);
        setSharedState(null);
        setAllowMultipleActiveActivities(false);
        setActiveActivities([]);
        setSelectedActivityId(null);
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

        const payload = await response
          .json()
          .catch(() => null);

        if (
          response.ok &&
          payload?.ok === true
        ) {
          /*
           * The public Live state endpoint already
           * returns the authoritative experience
           * status.
           *
           * Merge that status into the runtime
           * experience so participant-facing Live
           * blocks can react without requiring a
           * page refresh.
           */
          if (
            payload?.experience &&
            isLiveExperienceStatus(
              payload.experience.status,
            )
          ) {
            setRuntimeExperience(
              (currentExperience) => {
                const baseExperience =
                  currentExperience ??
                  liveExperience;

                if (!baseExperience) {
                  return null;
                }

                if (
                  baseExperience.status ===
                  payload.experience.status
                ) {
                  return baseExperience;
                }

                return {
                  ...baseExperience,
                  status:
                    payload.experience.status,
                };
              },
            );
          }

          if (payload?.sharedState) {
            setSharedState(
              payload.sharedState as LiveSharedState,
            );
          } else {
            setSharedState(null);
          }

const multipleMode =
  payload.sharedState?.allowMultipleActiveActivities === true;

const nextActiveActivities: LiveActiveActivity[] =
  Array.isArray(payload.sharedState?.activeActivities)
    ? payload.sharedState.activeActivities.filter(
                  (
                    activity: unknown,
                  ): activity is LiveActiveActivity => {
                    if (
                      !activity ||
                      typeof activity !== "object"
                    ) {
                      return false;
                    }

                    const candidate = activity as Record<
                      string,
                      unknown
                    >;

                    return (
                      typeof candidate.id === "string" &&
                      typeof candidate.activityType ===
                        "string" &&
                      typeof candidate.name === "string"
                    );
                  },
                )
              : [];

          setAllowMultipleActiveActivities(multipleMode);
          setActiveActivities(nextActiveActivities);

          const nextActiveIds = new Set(
            nextActiveActivities.map(
              (activity) => activity.id,
            ),
          );

          setSelectedActivityId((currentId) => {
            if (!multipleMode) {
              return (
                payload.sharedState?.currentActivityId ??
                null
              );
            }

            if (
              currentId &&
              nextActiveIds.has(currentId)
            ) {
              return currentId;
            }

            const legacyCurrentId =
              payload.sharedState?.currentActivityId;

            if (
              legacyCurrentId &&
              nextActiveIds.has(legacyCurrentId)
            ) {
              return legacyCurrentId;
            }

            return nextActiveActivities[0]?.id ?? null;
          });
        } else {
          setSharedState(null);
          setAllowMultipleActiveActivities(false);
          setActiveActivities([]);
          setSelectedActivityId(null);
        }
      } catch (error) {
        console.error(
          "Live shared state load failed:",
          error,
        );

        setSharedState(null);
        setAllowMultipleActiveActivities(false);
        setActiveActivities([]);
        setSelectedActivityId(null);
      } finally {
        setStateLoading(false);
      }
    },
    [liveExperience],
  );

const joinExperience = useCallback(
  async (
    displayName: string,
    avatarUrl?: string | null,
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
        setJoinError(
          "Enter a display name.",
        );

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
              "Content-Type":
                "application/json",
            },

body: JSON.stringify({
  displayName: safeDisplayName,
  avatarUrl:
    typeof avatarUrl === "string" &&
    avatarUrl.trim()
      ? avatarUrl.trim()
      : null,
}),
          },
        );

        const payload = await response
          .json()
          .catch(() => null);

        if (
          !response.ok ||
          payload?.ok !== true ||
          !payload?.participant
        ) {
          setJoinError(
            typeof payload?.error ===
              "string"
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

        const payload = await response
          .json()
          .catch(() => null);

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

  /*
   * Initial participant/session and shared-state
   * restore.
   */
  useEffect(() => {
    void refreshSession();
    void refreshSharedState();
  }, [
    refreshSession,
    refreshSharedState,
  ]);

  /*
   * Listen for non-sensitive Live change
   * notifications.
   *
   * The Broadcast itself is only a notification.
   * Authoritative state is always restored
   * through the server API.
   *
   * realtimeRevision also increments so activity
   * components can refetch their own authoritative
   * data even when the shared-state row itself was
   * not modified by the event.
   */
  useEffect(() => {
    if (!liveExperience?.id) {
      return;
    }

    const channel = supabase.channel(
      `live-experience-${liveExperience.id}`,
    );

    channel.on(
      "broadcast",
      {
        event: "shared-state-changed",
      },
      () => {
        setRealtimeRevision(
          (revision) => revision + 1,
        );

        void refreshSharedState();
        void refreshSession();
      },
    );

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(
        channel,
      );
    };
  }, [
    liveExperience?.id,
    refreshSharedState,
    refreshSession,
  ]);

  const value =
    useMemo<LiveRuntimeValue>(
      () => ({
        experience:
          runtimeExperience,

        participant,
        authenticated,

        sharedState,
        realtimeRevision,

        allowMultipleActiveActivities,
        activeActivityIds,
        activeActivities,
        selectedActivityId,
        selectActivity,

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
        runtimeExperience,
        participant,
        authenticated,
        sharedState,
        realtimeRevision,
        allowMultipleActiveActivities,
        activeActivityIds,
        activeActivities,
        selectedActivityId,
        selectActivity,
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
    <LiveRuntimeContext.Provider
      value={value}
    >
      {allowMultipleActiveActivities &&
      activeActivities.length > 1 &&
      authenticated ? (
        <nav
          aria-label="Live activity selection"
          className="fixed bottom-4 left-1/2 z-[100] w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white/95 p-3 text-neutral-900 shadow-xl backdrop-blur"
        >
          <div className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Live Activities
          </div>

          <div className="flex max-h-32 flex-wrap justify-center gap-2 overflow-y-auto">
            {activeActivities.map((activity) => {
              const selected =
                activity.id === selectedActivityId;

              return (
                <button
                  key={activity.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    selectActivity(activity.id)
                  }
                  className={[
                    "max-w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                  ].join(" ")}
                >
                  <span className="block truncate">
                    {activity.name}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      {children}
    </LiveRuntimeContext.Provider>
  );
}

export function useLiveRuntime() {
  const context =
    useContext(LiveRuntimeContext);

  if (!context) {
    throw new Error(
      "useLiveRuntime must be used within a LiveRuntimeProvider.",
    );
  }

  return context;
}